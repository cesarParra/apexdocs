import Handlebars from 'handlebars';
import {
  RenderableEnum,
  ConvertRenderableContentsToString,
  RenderableInterface,
  RenderableClass,
  StringOrLink,
} from './types';
import { heading, heading2, heading3, inlineCode, namespace, splitAndCapitalize } from './helpers';
import { typeDocPartial } from '../transpiler/markdown/plain-markdown/type-doc-partial';
import { methodsPartialTemplate } from '../transpiler/markdown/plain-markdown/methods-partial-template';
import { constructorsPartialTemplate } from '../transpiler/markdown/plain-markdown/constructors-partial-template';
import { fieldsPartialTemplate } from '../transpiler/markdown/plain-markdown/fieldsPartialTemplate';
import { documentablePartialTemplate } from '../transpiler/markdown/plain-markdown/documentable-partial-template';
import { classMarkdownTemplate } from '../transpiler/markdown/plain-markdown/class-template';
import { enumMarkdownTemplate } from '../transpiler/markdown/plain-markdown/enum-template';
import { interfaceMarkdownTemplate } from '../transpiler/markdown/plain-markdown/interface-template';

type CompileOptions = {
  renderableContentConverter: ConvertRenderableContentsToString;
  link: (source: StringOrLink) => string;
  codeBlockConverter: (language: string, lines: string[]) => Handlebars.SafeString;
};

export function compile(
  template: string,
  source: RenderableEnum | RenderableInterface | RenderableClass,
  options: CompileOptions,
) {
  Handlebars.registerPartial('typeDocumentation', typeDocPartial);
  Handlebars.registerPartial('documentablePartialTemplate', documentablePartialTemplate);
  Handlebars.registerPartial('methodsPartialTemplate', methodsPartialTemplate);
  Handlebars.registerPartial('constructorsPartialTemplate', constructorsPartialTemplate);
  Handlebars.registerPartial('fieldsPartialTemplate', fieldsPartialTemplate);
  Handlebars.registerPartial('classTemplate', classMarkdownTemplate);
  Handlebars.registerPartial('enumTemplate', enumMarkdownTemplate);
  Handlebars.registerPartial('interfaceTemplate', interfaceMarkdownTemplate);

  Handlebars.registerHelper('link', options.link);
  Handlebars.registerHelper('code', options.codeBlockConverter);
  Handlebars.registerHelper('withLinks', options.renderableContentConverter);
  Handlebars.registerHelper('heading', heading);
  Handlebars.registerHelper('heading2', heading2);
  Handlebars.registerHelper('heading3', heading3);
  Handlebars.registerHelper('inlineCode', inlineCode);
  Handlebars.registerHelper('splitAndCapitalize', splitAndCapitalize);

  const prepared = { ...source, namespace: namespace() };
  const compiled = Handlebars.compile(template);
  return (
    compiled(prepared)
      .trim()
      // clean up extra newlines
      .replace(/\n{3,}/g, '\n\n')
  );
}
