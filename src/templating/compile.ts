import Handlebars from 'handlebars';
import {
  EnumSource,
  ConvertRenderableContentsToString,
  InterfaceSource,
  ClassSource,
  MethodSource,
  RenderableContent,
  BaseDocAwareSource,
} from './types';
import { namespace, splitAndCapitalize } from './helpers';
import { typeLevelApexDocPartialTemplate } from '../transpiler/markdown/plain-markdown/type-level-apex-doc-partial-template';
import { methodsPartialTemplate } from '../transpiler/markdown/plain-markdown/methods-partial-template';
import { constructorsPartialTemplate } from '../transpiler/markdown/plain-markdown/constructors-partial-template';

type CompileOptions = {
  renderableContentConverter: ConvertRenderableContentsToString;
  codeBlockConverter: (language: string, lines: string[]) => string;
};

export function compile(template: string, source: EnumSource | InterfaceSource | ClassSource, options: CompileOptions) {
  Handlebars.registerPartial('typeLevelApexDocPartialTemplate', typeLevelApexDocPartialTemplate);
  Handlebars.registerPartial('methodsPartialTemplate', methodsPartialTemplate);
  Handlebars.registerPartial('constructorsPartialTemplate', constructorsPartialTemplate);
  Handlebars.registerHelper('splitAndCapitalize', splitAndCapitalize);

  const prepared = { ...prepare(source, options), namespace: namespace() };
  const compiled = Handlebars.compile(template);
  return (
    compiled(prepared)
      .trim()
      // clean up extra newlines
      .replace(/\n{3,}/g, '\n\n')
  );
}

function prepare(
  source: EnumSource | InterfaceSource | ClassSource,
  { renderableContentConverter, codeBlockConverter }: CompileOptions,
) {
  if (isEnumSource(source)) {
    return prepareEnum(source, renderableContentConverter, codeBlockConverter);
  } else if (isInterfaceSource(source)) {
    return prepareInterface(source, renderableContentConverter, codeBlockConverter);
  } else {
    return prepareClass(source, renderableContentConverter, codeBlockConverter);
  }
}

function prepareBase(
  source: BaseDocAwareSource,
  renderableContentConverter: ConvertRenderableContentsToString,
  codeBlockConverter: (language: string, lines: string[]) => string,
) {
  return {
    description: renderableContentConverter(source.description),
    mermaid: source.mermaid ? codeBlockConverter('mermaid', source.mermaid) : undefined,
    example: source.example ? codeBlockConverter('apex', source.example) : undefined,
    customTags: source.customTags?.map((tag) => ({
      name: tag.name,
      value: renderableContentConverter(tag.value),
    })),
  };
}

function prepareEnum(
  source: EnumSource,
  renderableContentConverter: ConvertRenderableContentsToString,
  codeBlockConverter: (language: string, lines: string[]) => string,
) {
  return {
    ...source,
    ...prepareBase(source, renderableContentConverter, codeBlockConverter),
    values: source.values.map((value) => ({
      value: value.value,
      description: renderableContentConverter(value.description),
    })),
  };
}

function mapMethod(
  method: MethodSource,
  renderableContentConverter: (content?: RenderableContent[]) => string,
  codeBlockConverter: (language: string, lines: string[]) => string,
) {
  return {
    ...method,
    ...prepareBase(method, renderableContentConverter, codeBlockConverter),
    returnType: {
      ...method,
      type: method.returnType?.type ? renderableContentConverter([method.returnType.type]) : undefined,
      description: renderableContentConverter(method.returnType?.description),
    },
    throws: method.throws?.map((thrown) => ({
      ...thrown,
      type: renderableContentConverter([thrown.type]),
      description: renderableContentConverter(thrown.description),
    })),
    parameters: method.parameters?.map((param) => ({
      ...param,
      type: renderableContentConverter([param.type]),
      description: renderableContentConverter(param.description),
    })),
  };
}

function mapConstructor(
  constructor: MethodSource,
  renderableContentConverter: (content?: RenderableContent[]) => string,
  codeBlockConverter: (language: string, lines: string[]) => string,
) {
  return {
    ...constructor,
    ...prepareBase(constructor, renderableContentConverter, codeBlockConverter),
    parameters: constructor.parameters?.map((param) => ({
      ...param,
      type: renderableContentConverter([param.type]),
      description: renderableContentConverter(param.description),
    })),
    throws: constructor.throws?.map((thrown) => ({
      ...thrown,
      type: renderableContentConverter([thrown.type]),
      description: renderableContentConverter(thrown.description),
    })),
  };
}

function prepareInterface(
  source: InterfaceSource,
  renderableContentConverter: ConvertRenderableContentsToString,
  codeBlockConverter: (language: string, lines: string[]) => string,
) {
  return {
    ...source,
    ...prepareBase(source, renderableContentConverter, codeBlockConverter),
    extends: source.extends?.map((ext) => renderableContentConverter([ext])),
    methods: source.methods?.map((method) => mapMethod(method, renderableContentConverter, codeBlockConverter)),
  };
}

function prepareClass(
  source: ClassSource,
  renderableContentConverter: ConvertRenderableContentsToString,
  codeBlockConverter: (language: string, lines: string[]) => string,
) {
  return {
    ...source,
    ...prepareBase(source, renderableContentConverter, codeBlockConverter),
    implements: source.implements?.map((impl) => renderableContentConverter([impl])),
    extends: source.extends ? renderableContentConverter([source.extends]) : undefined,
    constructors: source.constructors?.map((constructor) =>
      mapConstructor(constructor, renderableContentConverter, codeBlockConverter),
    ),
    methods: source.methods?.map((method) => mapMethod(method, renderableContentConverter, codeBlockConverter)),
  };
}

function isEnumSource(source: { __type: string }): source is EnumSource {
  return source.__type === 'enum';
}

function isInterfaceSource(source: { __type: string }): source is InterfaceSource {
  return source.__type === 'interface';
}
