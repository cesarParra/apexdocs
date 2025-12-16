import Handlebars from 'handlebars';
import { typeDocPartial } from './markdown/templates/type-doc-partial';
import { documentablePartialTemplate } from './markdown/templates/documentable-partial-template';
import { methodsPartialTemplate } from './markdown/templates/methods-partial-template';
import { groupedMembersPartialTemplate } from './markdown/templates/grouped-members-partial-template';
import { constructorsPartialTemplate } from './markdown/templates/constructors-partial-template';
import { fieldsPartialTemplate } from './markdown/templates/fieldsPartialTemplate';
import { classMarkdownTemplate } from './markdown/templates/class-template';
import { enumMarkdownTemplate } from './markdown/templates/enum-template';
import { interfaceMarkdownTemplate } from './markdown/templates/interface-template';
import {
  link,
  code,
  renderContent,
  heading,
  inlineCode,
  eq,
  add,
  lookup,
  parseJSON,
  startsWith,
  substring,
  splitAndCapitalize,
} from './template-helpers';

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
    Handlebars.registerPartial('groupedMembersPartialTemplate', groupedMembersPartialTemplate);
    Handlebars.registerPartial('fieldsPartialTemplate', fieldsPartialTemplate);
    Handlebars.registerPartial('classTemplate', classMarkdownTemplate);
    Handlebars.registerPartial('enumTemplate', enumMarkdownTemplate);
    Handlebars.registerPartial('interfaceTemplate', interfaceMarkdownTemplate);

    // Register helpers from template-helpers
    Handlebars.registerHelper('link', (source) => {
      return new Handlebars.SafeString(link(source));
    });
    Handlebars.registerHelper('code', (codeBlock) => {
      return new Handlebars.SafeString(code(codeBlock));
    });
    // Pass escapeExpression to renderContent for security - it escapes HTML special characters
    // in user-provided content (like strings and link titles) to prevent XSS attacks
    Handlebars.registerHelper('renderContent', (content) => {
      return renderContent(content, Handlebars.escapeExpression);
    });
    Handlebars.registerHelper('heading', heading);
    Handlebars.registerHelper('inlineCode', (text) => {
      return new Handlebars.SafeString(inlineCode(text));
    });
    Handlebars.registerHelper('splitAndCapitalize', splitAndCapitalize);
    Handlebars.registerHelper('eq', eq);
    Handlebars.registerHelper('add', add);
    Handlebars.registerHelper('lookup', lookup);
    Handlebars.registerHelper('parseJSON', parseJSON);
    Handlebars.registerHelper('startsWith', startsWith);
    Handlebars.registerHelper('substring', substring);
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
