import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';

import { referenceGuideTemplate } from './templates/reference-guide';
import { apply } from '#utils/fp';
import { DocumentationConfig, DocumentationBundle, SourceFile } from '../shared/types';
import { parsedFilesToRenderableBundle } from './adapters/renderable-bundle';
import { reflectSourceCode } from './reflection/reflect-source';
import { checkForReflectionErrors, ReflectionError } from './reflection/error-handling';
import { addInheritanceChainToTypes } from './reflection/inheritance-chain-expanion';
import { addInheritedMembersToTypes } from './reflection/inherited-member-expansion';
import { convertToDocumentationBundle } from './adapters/renderable-to-page-data';

const configDefaults: DocumentationConfig = {
  scope: ['public'],
  outputDir: 'docs',
  defaultGroupName: 'Miscellaneous',
  referenceGuideTemplate: referenceGuideTemplate,
};

export function generateDocs(
  apexBundles: SourceFile[],
  config?: Partial<DocumentationConfig>,
): E.Either<ReflectionError[], DocumentationBundle> {
  const configWithDefaults = { ...configDefaults, ...config };

  // TODO
  //const filterOutOfScope = apply(filterTypesOutOfScope, configWithDefaults.scope);
  const convertToRenderableBundle = apply(parsedFilesToRenderableBundle, configWithDefaults);
  const convertToDocumentationBundleForTemplate = apply(
    convertToDocumentationBundle,
    configWithDefaults.referenceGuideTemplate,
  );

  return pipe(
    apexBundles,
    reflectSourceCode,
    checkForReflectionErrors,
    // TODO
    //E.map(filterOutOfScope),
    E.map(addInheritedMembersToTypes),
    E.map(addInheritanceChainToTypes),
    E.map(convertToRenderableBundle),
    E.map(convertToDocumentationBundleForTemplate),
  );
}

// TODO
// function filterTypesOutOfScope(scope: string[], types: Type[]): Type[] {
//   return new Manifest(types).filteredByAccessModifierAndAnnotations(scope);
// }
