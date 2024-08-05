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
import { Template } from './templates/template';
import { hookableTemplate } from './templates/hookable';
import { ClassMirror, EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';

export type MarkdownGeneratorConfig = Pick<
  UserDefinedMarkdownConfig,
  'targetDir' | 'scope' | 'namespace' | 'defaultGroupName' | 'transformReferenceGuide'
> & {
  referenceGuideTemplate: string;
  sortMembersAlphabetically: boolean;
};

type Named = { name: string };

function sortByNames<T extends Named>(shouldSort: boolean, a: T, b: T): number {
  if (shouldSort) {
    return a.name.localeCompare(b.name);
  }
  return 0;
}

function sortNamed<T extends Named>(shouldSort: boolean, items: T[]): T[] {
  return items.sort((a, b) => sortByNames(shouldSort, a, b));
}

function sortTypeMember(type: Type, shouldSort: boolean): Type {
  switch (type.type_name) {
    case 'enum':
      return sortEnumValues(shouldSort, type as EnumMirror);
    case 'interface':
      return sortInterfaceMethods(shouldSort, type as InterfaceMirror);
    case 'class':
      return sortClassMembers(shouldSort, type as ClassMirror);
  }
}

function sortEnumValues(shouldSort: boolean, enumType: EnumMirror): EnumMirror {
  return {
    ...enumType,
    values: sortNamed(shouldSort, enumType.values),
  };
}

function sortInterfaceMethods(shouldSort: boolean, interfaceType: InterfaceMirror): InterfaceMirror {
  return {
    ...interfaceType,
    methods: sortNamed(shouldSort, interfaceType.methods),
  };
}

function sortClassMembers(shouldSort: boolean, classType: ClassMirror): ClassMirror {
  return {
    ...classType,
    fields: sortNamed(shouldSort, classType.fields),
    classes: sortNamed(shouldSort, classType.classes),
  };
}

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
    // Sort member values
    E.map((parsedFiles) =>
      parsedFiles.map((parsedFile) => ({
        ...parsedFile,
        type: sortTypeMember(parsedFile.type, config.sortMembersAlphabetically),
      })),
    ),
    E.map(convertToRenderableBundle),
    E.map(convertToDocumentationBundleForTemplate),
    E.map((bundle) => ({
      referenceGuide: transformReferenceGuide(bundle.referenceGuide, config.transformReferenceGuide),
      docs: bundle.docs,
    })),
    E.map((bundle) => ({
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

function transformReferenceGuide(
  referenceGuide: ReferenceGuidePageData,
  hook: TransformReferenceGuide = passThroughHook,
): ReferenceGuidePageData {
  return {
    ...referenceGuide,
    ...hook(referenceGuide),
  };
}
