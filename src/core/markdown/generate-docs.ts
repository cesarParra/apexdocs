import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';

import { apply } from '#utils/fp';
import {
  DocumentationBundle,
  ReferenceGuidePageData,
  SourceFile,
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

export type MarkdownGeneratorConfig = Pick<
  UserDefinedMarkdownConfig,
  'targetDir' | 'scope' | 'namespace' | 'defaultGroupName' | 'transformReferenceGuide'
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
    TE.map((bundle: DocumentationBundle) => ({
      referenceGuide: {
        ...bundle.referenceGuide,
        content: Template.getInstance().compile({
          source: {
            frontmatter: bundle.referenceGuide.frontmatter,
            content: bundle.referenceGuide.content,
          },
          template: hookableTemplate,
        }),
      },
      docs: bundle.docs,
    })),
  );
}

// Configurable hooks
function passThroughHook<T>(value: T): T {
  return value;
}

const documentationBundleHook = async (
  bundle: DocumentationBundle,
  config: MarkdownGeneratorConfig,
): Promise<DocumentationBundle> => {
  return {
    referenceGuide: await transformReferenceGuide(bundle.referenceGuide, config.transformReferenceGuide),
    docs: bundle.docs,
  };
};

const transformReferenceGuide = async (
  referenceGuide: ReferenceGuidePageData,
  hook: TransformReferenceGuide = passThroughHook,
) => {
  // TODO: Things in hooks might fail (we don't know, cause it is configurable), so let's
  // make sure we are using the pipe function to handle errors.

  return {
    ...referenceGuide,
    ...(await hook(referenceGuide)),
  };
};
