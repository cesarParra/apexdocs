import Handlebars from 'handlebars';
import { typeDocPartial } from '../transpiler/markdown/plain-markdown/type-doc-partial';
import { documentablePartialTemplate } from '../transpiler/markdown/plain-markdown/documentable-partial-template';
import { methodsPartialTemplate } from '../transpiler/markdown/plain-markdown/methods-partial-template';
import { constructorsPartialTemplate } from '../transpiler/markdown/plain-markdown/constructors-partial-template';
import { fieldsPartialTemplate } from '../transpiler/markdown/plain-markdown/fieldsPartialTemplate';
import { classMarkdownTemplate } from '../transpiler/markdown/plain-markdown/class-template';
import { enumMarkdownTemplate } from '../transpiler/markdown/plain-markdown/enum-template';
import { interfaceMarkdownTemplate } from '../transpiler/markdown/plain-markdown/interface-template';
import { link, resolveLinksInContent } from './markdown-helpers/resolve-links';
import { convertCodeBlock } from './markdown-helpers/convert-code-block';
import { heading, heading2, heading3, inlineCode, splitAndCapitalize } from '../templating/helpers';

export type CompilationRequest = {
  template: string;
  source: unknown;
};

export class Template {
  private static instance: Template;

  private constructor() {
    Handlebars.registerPartial('typeDocumentation', typeDocPartial);
    Handlebars.registerPartial('documentablePartialTemplate', documentablePartialTemplate);
    Handlebars.registerPartial('methodsPartialTemplate', methodsPartialTemplate);
    Handlebars.registerPartial('constructorsPartialTemplate', constructorsPartialTemplate);
    Handlebars.registerPartial('fieldsPartialTemplate', fieldsPartialTemplate);
    Handlebars.registerPartial('classTemplate', classMarkdownTemplate);
    Handlebars.registerPartial('enumTemplate', enumMarkdownTemplate);
    Handlebars.registerPartial('interfaceTemplate', interfaceMarkdownTemplate);

    Handlebars.registerHelper('link', link);
    Handlebars.registerHelper('code', convertCodeBlock);
    Handlebars.registerHelper('withLinks', resolveLinksInContent);
    Handlebars.registerHelper('heading', heading);
    Handlebars.registerHelper('heading2', heading2);
    Handlebars.registerHelper('heading3', heading3);
    Handlebars.registerHelper('inlineCode', inlineCode);
    Handlebars.registerHelper('splitAndCapitalize', splitAndCapitalize);
  }

  public static getInstance(): Template {
    if (!Template.instance) {
      Template.instance = new Template();
    }
    return Template.instance;
  }

  compile(request: CompilationRequest): string {
    const compiled = Handlebars.compile(request.template);
    return (
      compiled(request.source)
        .trim()
        // clean up extra newlines
        .replace(/\n{3,}/g, '\n\n')
    );
  }
}
