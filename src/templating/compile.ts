import Handlebars from 'handlebars';
import {
  RenderableEnum,
  ConvertRenderableContentsToString,
  RenderableInterface,
  RenderableClass,
  StringOrLink,
} from './types';
import { heading, namespace, splitAndCapitalize } from './helpers';
import { typeDocPartial } from '../transpiler/markdown/plain-markdown/type-doc-partial';
import { methodsPartialTemplate } from '../transpiler/markdown/plain-markdown/methods-partial-template';
import { constructorsPartialTemplate } from '../transpiler/markdown/plain-markdown/constructors-partial-template';
import { fieldsPartialTemplate } from '../transpiler/markdown/plain-markdown/fieldsPartialTemplate';
import { documentablePartialTemplate } from '../transpiler/markdown/plain-markdown/documentable-partial-template';

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

  Handlebars.registerHelper('link', options.link);
  Handlebars.registerHelper('code', options.codeBlockConverter);
  Handlebars.registerHelper('withLinks', options.renderableContentConverter);
  Handlebars.registerHelper('heading', heading);
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

// function prepareRenderable(source: any) {
//   // Go through every property of the received object.
//   // If it is a simple object (string, number) then
//   // keep as is. If it is an array, recur
// }
//
// function prepare(
//   source: RenderableEnum | RenderableInterface | RenderableClass,
//   { renderableContentConverter, codeBlockConverter }: CompileOptions,
// ) {
//   const base = {
//     ...source,
//     ...prepareDocumentable(source, renderableContentConverter, codeBlockConverter),
//     ...prepareBaseType(source, renderableContentConverter),
//   };
//   if (isEnumSource(source)) {
//     return {
//       ...base,
//       ...prepareEnum(source, renderableContentConverter),
//     };
//   } else if (isInterfaceSource(source)) {
//     return {
//       ...base,
//       ...prepareInterface(source, renderableContentConverter, codeBlockConverter),
//     };
//   } else {
//     return {
//       ...base,
//       ...prepareClass(source, renderableContentConverter, codeBlockConverter),
//     };
//   }
// }
//
// function prepareDocumentable(
//   source: RenderableDocumentation,
//   renderableContentConverter: ConvertRenderableContentsToString,
//   codeBlockConverter: (language: string, lines: string[]) => string,
// ) {
//   return {
//     description: renderableContentConverter(source.description),
//     mermaid: source.mermaid ? codeBlockConverter('mermaid', source.mermaid) : undefined,
//     example: source.example ? codeBlockConverter('apex', source.example) : undefined,
//     customTags: source.customTags?.map((tag) => ({
//       name: tag.name,
//       value: renderableContentConverter(tag.description),
//     })),
//   };
// }
//
// function prepareBaseType(
//   source: RenderableEnum | RenderableInterface | RenderableClass,
//   renderableContentConverter: ConvertRenderableContentsToString,
// ) {
//   return {
//     sees: source.sees?.map((see) => renderableContentConverter([see])),
//   };
// }
//
// function prepareEnum(source: RenderableEnum, renderableContentConverter: ConvertRenderableContentsToString) {
//   return {
//     values: source.values.map((value) => ({
//       value: value.value,
//       description: renderableContentConverter(value.description),
//     })),
//   };
// }
//
// function prepareInterface(
//   source: RenderableInterface,
//   renderableContentConverter: ConvertRenderableContentsToString,
//   codeBlockConverter: (language: string, lines: string[]) => string,
// ) {
//   return {
//     extends: source.extends?.map((ext) => renderableContentConverter([ext])),
//     methods: source.methods?.map((method) => mapMethod(method, renderableContentConverter, codeBlockConverter)),
//   };
// }
//
// function prepareClass(
//   source: RenderableClass,
//   renderableContentConverter: ConvertRenderableContentsToString,
//   codeBlockConverter: (language: string, lines: string[]) => string,
// ) {
//   return {
//     implements: source.implements?.map((impl) => renderableContentConverter([impl])),
//     extends: source.extends ? renderableContentConverter([source.extends]) : undefined,
//     constructors: source.constructors?.map((constructor) =>
//       mapConstructor(constructor, renderableContentConverter, codeBlockConverter),
//     ),
//     methods: source.methods?.map((method) => mapMethod(method, renderableContentConverter, codeBlockConverter)),
//     fields: source.fields?.map((field) => ({
//       ...field,
//       ...prepareDocumentable(field, renderableContentConverter, codeBlockConverter),
//       type: renderableContentConverter([field.type]),
//     })),
//   };
// }
//
// function mapMethod(
//   method: RenderableMethod,
//   renderableContentConverter: (content?: RenderableContent[]) => string,
//   codeBlockConverter: (language: string, lines: string[]) => string,
// ) {
//   return {
//     ...method,
//     ...prepareDocumentable(method, renderableContentConverter, codeBlockConverter),
//     returnType: {
//       ...method,
//       type: method.returnType?.type ? renderableContentConverter([method.returnType.type]) : undefined,
//       description: renderableContentConverter(method.returnType?.description),
//     },
//     throws: method.throws?.map((thrown) => ({
//       ...thrown,
//       type: renderableContentConverter([thrown.type]),
//       description: renderableContentConverter(thrown.description),
//     })),
//     parameters: method.parameters?.map((param) => ({
//       ...param,
//       type: renderableContentConverter([param.type]),
//       description: renderableContentConverter(param.description),
//     })),
//   };
// }
//
// function mapConstructor(
//   constructor: RenderableMethod,
//   renderableContentConverter: (content?: RenderableContent[]) => string,
//   codeBlockConverter: (language: string, lines: string[]) => string,
// ) {
//   return {
//     ...constructor,
//     ...prepareDocumentable(constructor, renderableContentConverter, codeBlockConverter),
//     parameters: constructor.parameters?.map((param) => ({
//       ...param,
//       type: renderableContentConverter([param.type]),
//       description: renderableContentConverter(param.description),
//     })),
//     throws: constructor.throws?.map((thrown) => ({
//       ...thrown,
//       type: renderableContentConverter([thrown.type]),
//       description: renderableContentConverter(thrown.description),
//     })),
//   };
// }
//
// function isEnumSource(source: { __type: string }): source is RenderableEnum {
//   return source.__type === 'enum';
// }
//
// function isInterfaceSource(source: { __type: string }): source is RenderableInterface {
//   return source.__type === 'interface';
// }
