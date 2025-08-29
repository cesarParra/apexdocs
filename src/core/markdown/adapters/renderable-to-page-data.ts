import { ReferenceGuideReference, Renderable, RenderableBundle } from '../../renderables/types';
import { DocPageData, DocumentationBundle } from '../../shared/types';
import { pipe } from 'fp-ts/function';
import { CompilationRequest, Template } from '../../template';
import { enumMarkdownTemplate } from '../templates/enum-template';
import { interfaceMarkdownTemplate } from '../templates/interface-template';
import { classMarkdownTemplate } from '../templates/class-template';
import { markdownDefaults } from '../../../defaults';
import { customObjectTemplate } from '../templates/custom-object-template';
import { triggerMarkdownTemplate } from '../templates/trigger-template';
import { Translations } from '../../translations';
import { lwcBundleTemplate } from '../templates/lwc-bundle-template';

export const convertToDocumentationBundle = (
  referenceGuideTitle: string,
  referenceGuideTemplate: string,
  translations: Translations,
  { referencesByGroup, renderables }: RenderableBundle,
): DocumentationBundle => ({
  referenceGuide: {
    frontmatter: null,
    content: referencesToReferenceGuideContent(referenceGuideTitle, referencesByGroup, referenceGuideTemplate),
    outputDocPath: 'index.md',
  },
  docs: renderables.map((renderable: Renderable) =>
    renderableToPageData(Object.values(referencesByGroup).flat(), renderable, translations),
  ),
});

function referencesToReferenceGuideContent(
  referenceGuideTitle: string,
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
      source: { referenceGuideTitle: referenceGuideTitle, references },
    }),
  );
}

function renderableToPageData(
  referenceGuideReference: ReferenceGuideReference[],
  renderable: Renderable,
  translations: Translations,
): DocPageData {
  function buildDocOutput(renderable: Renderable, docContents: string): DocPageData {
    const reference: ReferenceGuideReference = referenceGuideReference.find(
      (ref) => ref.reference.source.name.toLowerCase() === renderable.name.toLowerCase(),
    )!;

    return {
      source: {
        filePath: renderable.filePath,
        name: renderable.name,
        type: renderable.type,
      },
      outputDocPath: reference!.reference.outputDocPath,
      frontmatter: null,
      content: docContents,
      group: renderable.doc.group ?? markdownDefaults.defaultGroupName,
      type: renderable.type,
    };
  }

  return pipe(
    renderable,
    (r) => resolveTemplate(r, translations),
    compile,
    (docContents) => buildDocOutput(renderable, docContents),
  );
}

function resolveTemplate(renderable: Renderable, translations: Translations): CompilationRequest {
  function getTemplate(renderable: Renderable): string {
    switch (renderable.type) {
      case 'enum':
        return enumMarkdownTemplate;
      case 'interface':
        return interfaceMarkdownTemplate;
      case 'class':
        return classMarkdownTemplate;
      case 'customobject':
        return customObjectTemplate;
      case 'trigger':
        return triggerMarkdownTemplate;
      case 'lwc':
        return lwcBundleTemplate;
    }
  }

  return {
    template: getTemplate(renderable),
    source: {
      ...renderable,
      translations,
    },
  };
}

function compile(request: CompilationRequest): string {
  return Template.getInstance().compile(request);
}
