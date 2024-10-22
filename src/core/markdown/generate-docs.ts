import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import yaml from 'js-yaml';

import { apply } from '#utils/fp';
import {
  DocPageData,
  DocumentationBundle,
  Frontmatter,
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
  UnparsedCustomObjectBundle,
  UnparsedSourceBundle,
  UnparsedCustomFieldBundle,
} from '../shared/types';
import { parsedFilesToRenderableBundle } from './adapters/renderable-bundle';
import { reflectApexSource } from '../reflection/apex/reflect-apex-source';
import { addInheritanceChainToTypes } from '../reflection/apex/inheritance-chain-expanion';
import { addInheritedMembersToTypes } from '../reflection/apex/inherited-member-expansion';
import { convertToDocumentationBundle } from './adapters/renderable-to-page-data';
import { filterScope } from '../reflection/apex/filter-scope';
import { Template } from '../template';
import { hookableTemplate } from './templates/hookable';
import { sortTypesAndMembers } from '../reflection/sort-types-and-members';
import { isSkip } from '../shared/utils';
import { parsedFilesToReferenceGuide } from './adapters/reference-guide';
import { removeExcludedTags } from '../reflection/apex/remove-excluded-tags';
import { HookError } from '../errors/errors';
import { CustomObjectMetadata } from '../reflection/sobject/reflect-custom-object-sources';
import { Type } from '@cparra/apex-reflection';
import { reflectCustomFieldsAndObjects } from '../reflection/sobject/reflectCustomFieldsAndObjects';

export type MarkdownGeneratorConfig = Omit<
  UserDefinedMarkdownConfig,
  'sourceDir' | 'targetGenerator' | 'includeMetadata'
> & {
  referenceGuideTemplate: string;
};

export function generateDocs(unparsedBundles: UnparsedSourceBundle[], config: MarkdownGeneratorConfig) {
  const convertToReferences = apply(parsedFilesToReferenceGuide, config);
  const convertToRenderableBundle = apply(parsedFilesToRenderableBundle, config);
  const convertToDocumentationBundleForTemplate = apply(
    convertToDocumentationBundle,
    config.referenceGuideTitle,
    config.referenceGuideTemplate,
  );
  const sort = apply(sortTypesAndMembers, config.sortAlphabetically);

  function filterApexSourceFiles(sourceFiles: UnparsedSourceBundle[]): UnparsedApexBundle[] {
    return sourceFiles.filter((sourceFile): sourceFile is UnparsedApexBundle => sourceFile.type === 'apex');
  }

  function filterCustomObjectsAndFields(
    sourceFiles: UnparsedSourceBundle[],
  ): (UnparsedCustomObjectBundle | UnparsedCustomFieldBundle)[] {
    return sourceFiles.filter(
      (sourceFile): sourceFile is UnparsedCustomObjectBundle =>
        sourceFile.type === 'customobject' || sourceFile.type === 'customfield',
    );
  }

  function filterOutCustomFields(parsedFiles: ParsedFile[]): ParsedFile<Type | CustomObjectMetadata>[] {
    return parsedFiles.filter(
      (parsedFile): parsedFile is ParsedFile<Type | CustomObjectMetadata> => parsedFile.source.type !== 'customfield',
    );
  }

  return pipe(
    generateForApex(filterApexSourceFiles(unparsedBundles), config),
    TE.chain((parsedApexFiles) => {
      return pipe(
        reflectCustomFieldsAndObjects(filterCustomObjectsAndFields(unparsedBundles)),
        TE.map((parsedObjectFiles) => [...parsedApexFiles, ...parsedObjectFiles]),
      );
    }),
    TE.map((parsedFiles) => sort(filterOutCustomFields(parsedFiles))),
    TE.bindTo('parsedFiles'),
    TE.bind('references', ({ parsedFiles }) =>
      TE.right(
        // Custom fields should not show up in the reference guide
        convertToReferences(parsedFiles),
      ),
    ),
    TE.flatMap(({ parsedFiles, references }) => transformReferenceHook(config)({ references, parsedFiles })),
    TE.map(({ parsedFiles, references }) => convertToRenderableBundle(filterOutCustomFields(parsedFiles), references)),
    TE.map(convertToDocumentationBundleForTemplate),
    TE.flatMap(transformDocumentationBundleHook(config)),
    TE.map(postHookCompile),
  );
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
function passThroughHook<T>(value: T): T {
  return value;
}

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

function toFrontmatterString(frontmatter: Frontmatter): string {
  if (typeof frontmatter === 'string') {
    return frontmatter;
  }

  if (!frontmatter) {
    return '';
  }

  const yamlString = yaml.dump(frontmatter);
  return `---\n${yamlString}---\n`;
}
