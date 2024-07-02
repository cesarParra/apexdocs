import { reflect, Type } from '@cparra/apex-reflection';
import { typeToRenderableType } from '../adapters/apex-types';
import { Renderable, RenderableEnum } from '../templating/types';
import { classMarkdownTemplate } from '../transpiler/markdown/plain-markdown/class-template';
import { enumMarkdownTemplate } from '../transpiler/markdown/plain-markdown/enum-template';
import { interfaceMarkdownTemplate } from '../transpiler/markdown/plain-markdown/interface-template';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { flow } from 'fp-ts/function';
import { CompilationRequest, Template } from './template';

function doReflect(input: string): E.Either<string, Type> {
  const result = reflect(input);
  return result.error ? E.left(result.error.message) : E.right(result.typeMirror!);
}

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

function compile(request: CompilationRequest): string {
  return Template.getInstance().compile(request);
}

export const documentType = flow(typeToRenderableType, resolveTemplate, compile);

export type DocOutput = {
  docContents: string;
  format: 'markdown';
  typeName: string;
  type: 'class' | 'interface' | 'enum';
  group: O.Option<string>;
};

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
