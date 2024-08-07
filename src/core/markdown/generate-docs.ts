import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import yaml from 'js-yaml';

import { apply } from '#utils/fp';
import {
  DocPageData,
  DocumentationBundle,
  Frontmatter,
  PostHookDocumentationBundle,
  ReferenceGuidePageData,
  SourceFile,
  TransformDocPage,
  TransformDocs,
  TransformReferenceGuide,
  UserDefinedMarkdownConfig,
} from '../shared/types';
import { parsedFilesToRenderableBundle } from './adapters/renderable-bundle';
import { reflectSourceCode } from './reflection/reflect-source';
import { checkForReflectionErrors } from './reflection/error-handling';
import { addInheritanceChainToTypes } from './reflection/inheritance-chain-expanion';
import { addInheritedMembersToTypes } from './reflection/inherited-member-expansion';
import { convertToDocumentationBundle } from './adapters/renderable-to-page-data';
import { filterScope } from './reflection/filter-scope';
import { Template } from './templates/template';
import { hookableTemplate } from './templates/hookable';
import { sortMembers } from './reflection/sort-members';
import { isSkip } from '../shared/utils';

export type MarkdownGeneratorConfig = Pick<
  UserDefinedMarkdownConfig,
  | 'targetDir'
  | 'scope'
  | 'namespace'
  | 'defaultGroupName'
  | 'transformReferenceGuide'
  | 'transformDocs'
  | 'transformDocPage'
> & {
  referenceGuideTemplate: string;
  sortMembersAlphabetically: boolean;
};

export class HookError {
  readonly _tag = 'HookError';

  constructor(public error: unknown) {}
}

export function generateDocs(apexBundles: SourceFile[], config: MarkdownGeneratorConfig) {
  const filterOutOfScope = apply(filterScope, config.scope);
  const convertToRenderableBundle = apply(parsedFilesToRenderableBundle, config);
  const convertToDocumentationBundleForTemplate = apply(convertToDocumentationBundle, config.referenceGuideTemplate);
  const sortTypeMembers = apply(sortMembers, config.sortMembersAlphabetically);

  return pipe(
    apexBundles,
    reflectSourceCode,
    checkForReflectionErrors,
    E.map(filterOutOfScope),
    E.map(addInheritedMembersToTypes),
    E.map(addInheritanceChainToTypes),
    E.map(sortTypeMembers),
    E.map(convertToRenderableBundle),
    E.map(convertToDocumentationBundleForTemplate),
    TE.fromEither,
    TE.flatMap((bundle) =>
      TE.tryCatch(
        () => documentationBundleHook(bundle, config),
        (error) => new HookError(error),
      ),
    ),
    TE.map((bundle: PostHookDocumentationBundle) => ({
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
    })),
  );
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

// Configurable hooks
function passThroughHook<T>(value: T): T {
  return value;
}

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
