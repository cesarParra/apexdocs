import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';

import { apply } from '#utils/fp';
import {
  UserDefinedMarkdownConfig,
  DocumentationBundle,
  SourceFile,
  ReferenceGuidePageData,
  TransformReferenceGuide,
} from '../shared/types';
import { parsedFilesToRenderableBundle } from './adapters/renderable-bundle';
import { reflectSourceCode } from './reflection/reflect-source';
import { checkForReflectionErrors, ReflectionError } from './reflection/error-handling';
import { addInheritanceChainToTypes } from './reflection/inheritance-chain-expanion';
import { addInheritedMembersToTypes } from './reflection/inherited-member-expansion';
import { convertToDocumentationBundle } from './adapters/renderable-to-page-data';
import { filterScope } from './reflection/filter-scope';

export type MarkdownGeneratorConfig = Pick<
  UserDefinedMarkdownConfig,
  'targetDir' | 'scope' | 'namespace' | 'defaultGroupName' | 'sortMembersAlphabetically'
> & {
  referenceGuideTemplate: string;
};

export function generateDocs(
  apexBundles: SourceFile[],
  config: MarkdownGeneratorConfig,
): E.Either<ReflectionError[], DocumentationBundle> {
  const filterOutOfScope = apply(filterScope, config.scope);
  const convertToRenderableBundle = apply(parsedFilesToRenderableBundle, config);
  const convertToDocumentationBundleForTemplate = apply(convertToDocumentationBundle, config.referenceGuideTemplate);

  return pipe(
    apexBundles,
    reflectSourceCode,
    checkForReflectionErrors,
    E.map(filterOutOfScope),
    E.map(addInheritedMembersToTypes),
    E.map(addInheritanceChainToTypes),
    E.map(convertToRenderableBundle),
    E.map(convertToDocumentationBundleForTemplate),
    E.map((bundle) => ({
      referenceGuide: transformReferenceGuide(bundle.referenceGuide, passThroughHook),
      docs: bundle.docs,
    })),
  );
}

// Configurable hooks
function passThroughHook<T>(value: T): T {
  return value;
}

function transformReferenceGuide(
  referenceGuide: ReferenceGuidePageData,
  hook: TransformReferenceGuide = passThroughHook,
): ReferenceGuidePageData {
  return {
    ...referenceGuide,
    ...hook(referenceGuide),
  };
}
