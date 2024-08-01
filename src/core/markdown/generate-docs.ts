import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';

import { ReferenceGuideReference, Renderable, RenderableBundle, RenderableEnum } from './adapters/types';
import { CompilationRequest, Template } from './template';
import { referenceGuideTemplate } from './templates/reference-guide';
import { enumMarkdownTemplate } from './templates/enum-template';
import { interfaceMarkdownTemplate } from './templates/interface-template';
import { classMarkdownTemplate } from './templates/class-template';
import { apply } from '#utils/fp';
import { DocPageData, DocumentationConfig, ParsedFile, ReferenceGuidePageData, SourceFile } from '../shared/types';
import { parsedFilesToRenderableBundle } from './adapters/renderable-bundle';
import { reflectSourceCode } from './reflection/reflect-source';
import { checkForReflectionErrors, ReflectionError } from './reflection/error-handling';
import { addInheritedMembers } from './reflection/inherited-member-expansion';
import { addInheritanceChain } from './reflection/inheritance-chain-expanion';

export type DocumentationPageBundle = {
  referenceGuide: ReferenceGuidePageData;
  docs: DocPageData[];
};

const configDefaults: DocumentationConfig = {
  scope: ['public'],
  outputDir: 'docs',
  defaultGroupName: 'Miscellaneous',
  referenceGuideTemplate: referenceGuideTemplate,
};

const parsedFilesToTypes = (parsedFiles: ParsedFile[]) => parsedFiles.map((parsedFile) => parsedFile.type);

export function generateDocs(
  apexBundles: SourceFile[],
  config?: Partial<DocumentationConfig>,
): E.Either<ReflectionError[], DocumentationPageBundle> {
  const configWithDefaults = { ...configDefaults, ...config };

  // TODO
  //const filterOutOfScope = apply(filterTypesOutOfScope, configWithDefaults.scope);
  const convertToRenderableBundle = apply(parsedFilesToRenderableBundle, configWithDefaults);
  const addInheritedMembersToTypes = (parsedFiles: ParsedFile[]) =>
    parsedFiles.map((parsedFile) => addInheritedMembers(parsedFilesToTypes(parsedFiles), parsedFile));
  const addInheritanceChainToTypes = (parsedFiles: ParsedFile[]) =>
    parsedFiles.map((parsedFile) => ({
      ...parsedFile,
      type: addInheritanceChain(parsedFile.type, parsedFilesToTypes(parsedFiles)),
    }));
  const convertToDocumentationBundle = ({ references, renderables }: RenderableBundle): DocumentationPageBundle => ({
    referenceGuide: {
      directory: '',
      frontmatter: null,
      content: referencesToReferenceGuideContent(references, configWithDefaults.referenceGuideTemplate),
      fileExtension: 'md',
      fileName: 'index',
    },
    docs: renderables.map((renderable: Renderable) =>
      renderableToPageData(Object.values(references).flat(), renderable),
    ),
  });

  return pipe(
    apexBundles,
    reflectSourceCode,
    checkForReflectionErrors,
    // TODO
    //E.map(filterOutOfScope),
    E.map(addInheritedMembersToTypes),
    E.map(addInheritanceChainToTypes),
    E.map(convertToRenderableBundle),
    E.map(convertToDocumentationBundle),
  );
}

function renderableToPageData(referenceGuideReference: ReferenceGuideReference[], renderable: Renderable): DocPageData {
  function buildDocOutput(renderable: Renderable, docContents: string): DocPageData {
    const reference = referenceGuideReference.find(
      (ref) => ref.typeName.toLowerCase() === renderable.name.toLowerCase(),
    );

    const namespacePrefix = renderable.namespace ? `${renderable.namespace}.` : '';

    return {
      source: {
        filePath: renderable.filePath,
        name: renderable.name,
        type: renderable.type,
      },
      fileName: renderable.name,
      fileExtension: 'md',
      directory: `${namespacePrefix}${renderable.name}${reference?.directory}`,
      frontmatter: null,
      content: docContents,
    };
  }

  return pipe(renderable, resolveApexTypeTemplate, compile, (docContents) => buildDocOutput(renderable, docContents));
}

function referencesToReferenceGuideContent(
  references: { [key: string]: ReferenceGuideReference[] },
  template: string,
): string {
  function alphabetizeReferences(references: { [key: string]: ReferenceGuideReference[] }): {
    [key: string]: ReferenceGuideReference[];
  } {
    return Object.keys(references)
      .sort((a, b) => a.localeCompare(b))
      .reduce<{ [key: string]: ReferenceGuideReference[] }>((acc, key) => {
        acc[key] = references[key].sort((a, b) => a.title.toString().localeCompare(b.title.toString()));
        return acc;
      }, {});
  }

  return pipe(references, alphabetizeReferences, (references) =>
    compile({
      template: template,
      source: references,
    }),
  );
}

// TODO
// function filterTypesOutOfScope(scope: string[], types: Type[]): Type[] {
//   return new Manifest(types).filteredByAccessModifierAndAnnotations(scope);
// }

function resolveApexTypeTemplate(renderable: Renderable): CompilationRequest {
  function getTemplate(renderable: Renderable): string {
    switch (renderable.type) {
      case 'enum':
        return enumMarkdownTemplate;
      case 'interface':
        return interfaceMarkdownTemplate;
      case 'class':
        return classMarkdownTemplate;
    }
  }

  return {
    template: getTemplate(renderable),
    source: renderable as RenderableEnum,
  };
}

function compile(request: CompilationRequest): string {
  return Template.getInstance().compile(request);
}
