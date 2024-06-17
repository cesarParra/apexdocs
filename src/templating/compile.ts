import Handlebars from 'handlebars';
import { EnumSource, ConvertRenderableContentsToString, InterfaceSource } from './types';
import { namespacedName, splitAndCapitalize } from './helpers';
import { typeLevelApexDocPartialTemplate } from '../transpiler/markdown/plain-markdown/type-level-apex-doc-partial-template';

type CompileOptions = {
  renderableContentConverter: ConvertRenderableContentsToString;
  codeBlockConverter: (language: string, lines: string[]) => string;
};

export function compile(template: string, source: EnumSource | InterfaceSource, options: CompileOptions) {
  Handlebars.registerPartial('typeLevelApexDocPartialTemplate', typeLevelApexDocPartialTemplate);
  Handlebars.registerHelper('splitAndCapitalize', splitAndCapitalize);
  Handlebars.registerHelper('namespacedName', namespacedName);

  const prepared = prepare(source, options);
  const compiled = Handlebars.compile(template);
  return (
    compiled(prepared)
      .trim()
      // clean up extra newlines
      .replace(/\n{3,}/g, '\n\n')
  );
}

function prepare(
  source: EnumSource | InterfaceSource,
  { renderableContentConverter, codeBlockConverter }: CompileOptions,
) {
  if (isEnumSource(source)) {
    return prepareEnum(source, renderableContentConverter, codeBlockConverter);
  } else if (isInterfaceSource(source)) {
    return prepareInterface(source, renderableContentConverter, codeBlockConverter);
  }
}

function prepareBase(
  source: EnumSource | InterfaceSource,
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

function prepareInterface(
  source: InterfaceSource,
  renderableContentConverter: ConvertRenderableContentsToString,
  codeBlockConverter: (language: string, lines: string[]) => string,
) {
  return {
    ...source,
    ...prepareBase(source, renderableContentConverter, codeBlockConverter),
    methods: source.methods?.map((method) => ({
      ...method,
      description: renderableContentConverter(method.description),
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
      mermaid: method.mermaid ? codeBlockConverter('mermaid', method.mermaid) : undefined,
      example: method.example ? codeBlockConverter('apex', method.example) : undefined,
    })),
  };
}

function isEnumSource(source: EnumSource | InterfaceSource): source is EnumSource {
  return source.__type === 'enum';
}

function isInterfaceSource(source: EnumSource | InterfaceSource): source is InterfaceSource {
  return source.__type === 'interface';
}
