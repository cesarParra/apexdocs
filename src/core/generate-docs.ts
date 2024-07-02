import { reflect, Type } from '@cparra/apex-reflection';
import { typeToRenderableType } from '../adapters/apex-types';
import { Renderable, RenderableEnum } from '../templating/types';
import Handlebars from 'handlebars';
import { typeDocPartial } from '../transpiler/markdown/plain-markdown/type-doc-partial';
import { documentablePartialTemplate } from '../transpiler/markdown/plain-markdown/documentable-partial-template';
import { methodsPartialTemplate } from '../transpiler/markdown/plain-markdown/methods-partial-template';
import { constructorsPartialTemplate } from '../transpiler/markdown/plain-markdown/constructors-partial-template';
import { fieldsPartialTemplate } from '../transpiler/markdown/plain-markdown/fieldsPartialTemplate';
import { classMarkdownTemplate } from '../transpiler/markdown/plain-markdown/class-template';
import { enumMarkdownTemplate } from '../transpiler/markdown/plain-markdown/enum-template';
import { interfaceMarkdownTemplate } from '../transpiler/markdown/plain-markdown/interface-template';
import { heading, heading2, heading3, inlineCode, splitAndCapitalize } from '../templating/helpers';
import { link, resolveLinksInContent } from './markdown-helpers/resolve-links';
import { convertCodeBlock } from './markdown-helpers/convert-code-block';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { flow } from 'fp-ts/function';

function doReflect(input: string): E.Either<string, Type> {
  const result = reflect(input);
  return result.error ? E.left(result.error.message) : E.right(result.typeMirror!);
}

type CompilationRequest = {
  template: string;
  source: Renderable;
};

function resolveTemplate(renderable: Renderable): CompilationRequest {
  return {
    template: getTemplate(renderable),
    source: renderable as RenderableEnum,
  };
}

function getTemplate(renderable: Renderable): string {
  switch (renderable.__type) {
    case 'enum':
      return enumMarkdownTemplate;
    case 'interface':
      return interfaceMarkdownTemplate;
    case 'class':
      return classMarkdownTemplate;
  }
}

export type DocOutput = {
  docContents: string;
  format: 'markdown';
  typeName: string;
  type: 'class' | 'interface' | 'enum';
  group: O.Option<string>;
};

export const documentType = flow(typeToRenderableType, resolveTemplate, compile);

export function generateDocs(input: string): E.Either<string, DocOutput> {
  const result = doReflect(input);
  return E.match<string, Type, E.Either<string, DocOutput>>(
    (error) => E.left(error),
    (type) =>
      E.right({
        docContents: documentType(type),
        format: 'markdown',
        typeName: type.name,
        type: type.type_name,
        group: O.fromNullable(type.group),
      }),
  )(result);
}

function compile(request: CompilationRequest): string {
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

  const compiled = Handlebars.compile(request.template);
  return (
    compiled(request.source)
      .trim()
      // clean up extra newlines
      .replace(/\n{3,}/g, '\n\n')
  );
}
