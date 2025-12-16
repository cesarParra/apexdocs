import { ReferenceGuideReference, Renderable, RenderableBundle } from '../../renderables/types';
import {
  DocPageData,
  DocumentationBundle,
  TemplateConfig,
  TemplateHelpers,
  ReferenceGuideData,
} from '../../shared/types';
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
import { templateHelpers } from '../../template-helpers';

export const convertToDocumentationBundle = (
  referenceGuideTitle: string,
  referenceGuideTemplate: string,
  translations: Translations,
  { referencesByGroup, renderables }: RenderableBundle,
  templates?: TemplateConfig,
): DocumentationBundle => ({
  referenceGuide: {
    frontmatter: null,
    content: referencesToReferenceGuideContent(
      referenceGuideTitle,
      referencesByGroup,
      referenceGuideTemplate,
      templates,
    ),
    outputDocPath: 'index.md',
  },
  docs: renderables.map((renderable: Renderable) =>
    renderableToPageData(Object.values(referencesByGroup).flat(), renderable, translations, templates),
  ),
});

function referencesToReferenceGuideContent(
  referenceGuideTitle: string,
  references: { [key: string]: ReferenceGuideReference[] },
  template: string,
  templates?: TemplateConfig,
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

  // Use custom reference guide template if provided
  const referenceGuideTemplateConfig = templates?.referenceGuide;
  if (referenceGuideTemplateConfig) {
    // Alphabetize references first
    const alphabetizedReferences = alphabetizeReferences(references);
    const referenceGuideData: ReferenceGuideData = {
      referenceGuideTitle,
      references: alphabetizedReferences,
    };

    // Handle the template configuration
    const templateRequest = handleTemplateConfig(referenceGuideTemplateConfig, referenceGuideData, templateHelpers);

    // If handleTemplateConfig returned a template string, compile it
    if ('template' in templateRequest) {
      return compile({
        template: templateRequest.template,
        source: templateRequest.source,
      });
    }
  }

  // Use the default template
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
  templates?: TemplateConfig,
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
    (r) => resolveTemplate(r, translations, templates),
    (templateOrRequest) => compileTemplate(templateOrRequest),
    (docContents) => buildDocOutput(renderable, docContents),
  );
}

function resolveTemplate(
  renderable: Renderable,
  translations: Translations,
  templates?: TemplateConfig,
): CompilationRequest | { template: string; source: unknown } {
  // Check for custom template
  const customTemplate = getCustomTemplate(renderable, templates);
  if (customTemplate) {
    return customTemplate;
  }

  // Use default template
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

function getCustomTemplate(
  renderable: Renderable,
  templates?: TemplateConfig,
): { template: string; source: unknown } | null {
  if (!templates) {
    return null;
  }

  switch (renderable.type) {
    case 'enum':
      if (templates.enum) {
        return handleTemplateConfig(templates.enum, renderable, templateHelpers);
      }
      break;
    case 'interface':
      if (templates.interface) {
        return handleTemplateConfig(templates.interface, renderable, templateHelpers);
      }
      break;
    case 'class':
      if (templates.class) {
        return handleTemplateConfig(templates.class, renderable, templateHelpers);
      }
      break;
    case 'customobject':
      if (templates.customObject) {
        return handleTemplateConfig(templates.customObject, renderable, templateHelpers);
      }
      break;
    case 'trigger':
      if (templates.trigger) {
        return handleTemplateConfig(templates.trigger, renderable, templateHelpers);
      }
      break;
    case 'lwc':
      if (templates.lwc) {
        return handleTemplateConfig(templates.lwc, renderable, templateHelpers);
      }
      break;
  }

  return null;
}

function handleTemplateConfig<T>(
  templateConfig: string | ((renderable: T, helpers: TemplateHelpers) => string),
  renderable: T,
  helpers: TemplateHelpers,
): { template: string; source: unknown } {
  if (typeof templateConfig === 'string') {
    // String template - return as-is for Handlebars compilation
    return {
      template: templateConfig,
      source: renderable,
    };
  } else {
    // Function template - execute it synchronously (throw if async)
    const result = templateConfig(renderable, helpers);
     // For string results, we need to wrap it in a simple template
    return {
      template: '{{{content}}}',
      source: { content: result },
    };
  }
}

function compile(request: CompilationRequest): string {
  return Template.getInstance().compile(request);
}

function compileTemplate(templateOrRequest: CompilationRequest | { template: string; source: unknown }): string {
  if ('template' in templateOrRequest) {
    return Template.getInstance().compile(templateOrRequest);
  }
  throw new Error('Invalid template request');
}
