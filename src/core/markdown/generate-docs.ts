import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

import { apply } from '#utils/fp';
import {
  DocPageData,
  DocumentationBundle,
  PostHookDocumentationBundle,
  ReferenceGuidePageData,
  UnparsedApexBundle,
  TransformDocPage,
  TransformDocs,
  TransformReferenceGuide,
  UserDefinedMarkdownConfig,
  DocPageReference,
  TransformReference,
  ParsedFile,
  UnparsedSourceBundle,
  TopLevelType,
  MacroFunction,
} from '../shared/types';
import { mergeTranslations } from '../translations';
import { parsedFilesToRenderableBundle } from './adapters/renderable-bundle';
import { reflectApexSource } from '../reflection/apex/reflect-apex-source';
import { addInheritanceChainToTypes } from '../reflection/apex/inheritance-chain-expanion';
import { addInheritedMembersToTypes } from '../reflection/apex/inherited-member-expansion';
import { convertToDocumentationBundle } from './adapters/renderable-to-page-data';
import { filterScope } from '../reflection/apex/filter-scope';
import { Template } from '../template';
import { hookableTemplate } from './templates/hookable';
import { sortTypesAndMembers } from '../reflection/sort-types-and-members';
import { isSkip, passThroughHook, toFrontmatterString } from '../shared/utils';
import { parsedFilesToReferenceGuide } from './adapters/reference-guide';
import { removeExcludedTags } from '../reflection/apex/remove-excluded-tags';
import { HookError } from '../errors/errors';
import { reflectCustomFieldsAndObjectsAndMetadataRecords } from '../reflection/sobject/reflectCustomFieldsAndObjectsAndMetadataRecords';
import {
  filterApexSourceFiles,
  filterCustomObjectsFieldsAndMetadataRecords,
  filterLwcFiles,
  filterTriggerFiles,
} from '#utils/source-bundle-utils';
import { reflectTriggerSource } from '../reflection/trigger/reflect-trigger-source';
import { reflectLwcSource } from '../reflection/lwc/reflect-lwc-source';

export type MarkdownGeneratorConfig = Omit<
  UserDefinedMarkdownConfig,
  'sourceDir' | 'targetGenerator' | 'includeMetadata'
> & {
  referenceGuideTemplate: string;
};

export function generateDocs(unparsedBundles: UnparsedSourceBundle[], config: MarkdownGeneratorConfig) {
  const translations = mergeTranslations({ markdown: config.translations });
  const convertToReferences = apply(parsedFilesToReferenceGuide, config);
  const convertToRenderableBundle = apply(parsedFilesToRenderableBundle, config);
  const convertToDocumentationBundleForTemplate = apply(
    convertToDocumentationBundle,
    config.referenceGuideTitle,
    config.referenceGuideTemplate,
    translations,
  );
  const sort = apply(sortTypesAndMembers, config.sortAlphabetically);

  function filterOutCustomFieldsAndMetadata(parsedFiles: ParsedFile[]): ParsedFile<TopLevelType>[] {
    return parsedFiles.filter(
      (parsedFile): parsedFile is ParsedFile<TopLevelType> =>
        parsedFile.source.type !== 'customfield' && parsedFile.source.type !== 'custommetadata',
    );
  }

  return pipe(
    TE.right(replaceMacros(unparsedBundles, config.macros)),
    TE.flatMap((unparsedBundles) => generateForApex(filterApexSourceFiles(unparsedBundles), config)),
    TE.chain((parsedApexFiles) => {
      return pipe(
        reflectCustomFieldsAndObjectsAndMetadataRecords(
          filterCustomObjectsFieldsAndMetadataRecords(unparsedBundles),
          config.customObjectVisibility,
        ),
        TE.map((parsedObjectFiles) => [...parsedApexFiles, ...parsedObjectFiles]),
      );
    }),
    TE.chain((parsedFiles) => {
      return pipe(
        reflectTriggerSource(filterTriggerFiles(unparsedBundles)),
        TE.map((parsedTriggerFiles) => [...parsedFiles, ...parsedTriggerFiles]),
      );
    }),
    TE.chain((parsedFiles) => {
      return pipe(
        reflectLwcSource(filterLwcFiles(unparsedBundles)),
        TE.map((parsedFiles) => parsedFiles.filter((file) => file.type.isExposed)),
        TE.map((parsedLwcFiles) => [...parsedFiles, ...parsedLwcFiles]),
      );
    }),
    TE.map((parsedFiles) => sort(filterOutCustomFieldsAndMetadata(parsedFiles))),
    TE.bindTo('parsedFiles'),
    TE.bind('references', ({ parsedFiles }) =>
      TE.right(
        // Custom fields should not show up in the reference guide
        convertToReferences(parsedFiles),
      ),
    ),
    TE.flatMap(({ parsedFiles, references }) => transformReferenceHook(config)({ references, parsedFiles })),
    TE.map(({ parsedFiles, references }) =>
      convertToRenderableBundle(filterOutCustomFieldsAndMetadata(parsedFiles), references, translations),
    ),
    TE.map(convertToDocumentationBundleForTemplate),
    TE.flatMap(transformDocumentationBundleHook(config)),
    TE.map(postHookCompile),
  );
}

function replaceMacros(
  unparsedBundles: UnparsedSourceBundle[],
  macros: Record<string, MacroFunction> | undefined,
): UnparsedSourceBundle[] {
  if (!macros) {
    return unparsedBundles;
  }

  return unparsedBundles.map((bundle) => {
    return {
      ...bundle,
      content: Object.entries(macros).reduce((acc, [macroName, macroFunction]) => {
        return acc.replace(
          new RegExp(`{{${macroName}}}`, 'g'),
          macroFunction({
            type: bundle.type,
            name: bundle.name,
            filePath: bundle.filePath,
          }),
        );
      }, bundle.content),
    };
  });
}

function generateForApex(apexBundles: UnparsedApexBundle[], config: MarkdownGeneratorConfig) {
  const filterOutOfScope = apply(filterScope, config.scope);
  const removeExcluded = apply(removeExcludedTags, config.excludeTags);

  return pipe(
    apexBundles,
    reflectApexSource,
    TE.map(filterOutOfScope),
    TE.map(addInheritedMembersToTypes),
    TE.map(addInheritanceChainToTypes),
    TE.map(removeExcluded),
  );
}

function transformReferenceHook(config: MarkdownGeneratorConfig) {
  async function _execute(
    references: Record<string, DocPageReference>,
    parsedFiles: ParsedFile[],
    transformReference?: TransformReference | undefined,
  ): Promise<{
    references: Record<string, DocPageReference>;
    parsedFiles: ParsedFile[];
  }> {
    return {
      references: await execTransformReferenceHook(Object.values(references), transformReference),
      parsedFiles,
    };
  }

  return ({ references, parsedFiles }: { references: Record<string, DocPageReference>; parsedFiles: ParsedFile[] }) =>
    TE.tryCatch(
      () => _execute(references, parsedFiles, config.transformReference),
      (error) => new HookError(error),
    );
}

function transformDocumentationBundleHook(config: MarkdownGeneratorConfig) {
  return (bundle: DocumentationBundle) =>
    TE.tryCatch(
      () => documentationBundleHook(bundle, config),
      (error) => new HookError(error),
    );
}

// Configurable hooks

const execTransformReferenceHook = async (
  references: DocPageReference[],
  hook: TransformReference = passThroughHook,
): Promise<Record<string, DocPageReference>> => {
  const hooked = references.map<Promise<DocPageReference>>(async (reference) => {
    const hookedResult = await hook(reference);
    return {
      ...reference,
      ...hookedResult,
    };
  });
  const awaited = await Promise.all(hooked);

  return awaited.reduce<Record<string, DocPageReference>>((acc, reference) => {
    acc[reference.source.name] = reference;
    return acc;
  }, {});
};

const documentationBundleHook = async (
  bundle: DocumentationBundle,
  config: MarkdownGeneratorConfig,
): Promise<PostHookDocumentationBundle> => {
  return {
    referenceGuide: await transformReferenceGuide(bundle.referenceGuide, config.transformReferenceGuide),
    docs: await transformDocs(bundle.docs, config.transformDocs, config.transformDocPage),
  };
};

const transformReferenceGuide = async (
  referenceGuide: ReferenceGuidePageData,
  hook: TransformReferenceGuide = passThroughHook,
) => {
  const result = await hook(referenceGuide);
  if (isSkip(result)) {
    return result;
  }

  return {
    ...referenceGuide,
    ...(await hook(referenceGuide)),
  };
};

const transformDocs = async (
  docs: DocPageData[],
  transformDocsHook: TransformDocs = passThroughHook,
  transformDocPageHook: TransformDocPage = passThroughHook,
): Promise<Awaited<DocPageData[]>> => {
  const transformed = await transformDocsHook(docs);
  return Promise.all(transformed.map((doc) => transformDocPage(doc, transformDocPageHook)));
};

const transformDocPage = async (doc: DocPageData, hook: TransformDocPage = passThroughHook) => {
  return {
    ...doc,
    ...(await hook(doc)),
  };
};

function postHookCompile(bundle: PostHookDocumentationBundle) {
  return {
    referenceGuide: isSkip(bundle.referenceGuide)
      ? bundle.referenceGuide
      : {
          ...bundle.referenceGuide,
          content: Template.getInstance().compile({
            source: {
              frontmatter: toFrontmatterString(bundle.referenceGuide.frontmatter),
              content: bundle.referenceGuide.content,
            },
            template: hookableTemplate,
          }),
        },
    docs: bundle.docs.map((doc) => ({
      ...doc,
      content: Template.getInstance().compile({
        source: {
          frontmatter: toFrontmatterString(doc.frontmatter),
          content: doc.content,
        },
        template: hookableTemplate,
      }),
    })),
  };
}
