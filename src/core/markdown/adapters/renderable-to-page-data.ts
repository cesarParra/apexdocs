import { ReferenceGuideReference, Renderable, RenderableBundle, RenderableEnum } from './types';
import { DocPageData, DocumentationBundle } from '../../shared/types';
import { pipe } from 'fp-ts/function';
import { CompilationRequest, Template } from '../templates/template';
import { enumMarkdownTemplate } from '../templates/enum-template';
import { interfaceMarkdownTemplate } from '../templates/interface-template';
import { classMarkdownTemplate } from '../templates/class-template';

export const convertToDocumentationBundle = (
  referenceGuideTemplate: string,
  { references, renderables }: RenderableBundle,
): DocumentationBundle => ({
  referenceGuide: {
    directory: '',
    frontmatter: null,
    content: referencesToReferenceGuideContent(references, referenceGuideTemplate),
    fileExtension: 'md',
    fileName: 'index',
  },
  docs: renderables.map((renderable: Renderable) => renderableToPageData(Object.values(references).flat(), renderable)),
});

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
      fileName: `${namespacePrefix}${renderable.name}`,
      fileExtension: 'md',
      directory: `${reference?.directory}`,
      frontmatter: null,
      content: docContents,
      group: renderable.doc.group ?? 'Miscellaneous',
    };
  }

  return pipe(renderable, resolveApexTypeTemplate, compile, (docContents) => buildDocOutput(renderable, docContents));
}

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
