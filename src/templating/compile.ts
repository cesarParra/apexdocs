import Handlebars from 'handlebars';
import { EnumSource, ConvertRenderableContentsToString, InterfaceSource } from './types';
import { splitAndCapitalize } from './helpers';
import { typeLevelApexDocPartialTemplate } from '../transpiler/markdown/plain-markdown/type-level-apex-doc-partial-template';

type CompileOptions = {
  renderableContentConverter: ConvertRenderableContentsToString;
  codeBlockConverter: (language: string, lines: string[]) => string;
};

export function compile(template: string, source: EnumSource | InterfaceSource, options: CompileOptions) {
  Handlebars.registerPartial('typeLevelApexDocPartialTemplate', typeLevelApexDocPartialTemplate);
  Handlebars.registerHelper('splitAndCapitalize', splitAndCapitalize);
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
    return prepareEnum(source, renderableContentConverter);
  } else if (isInterfaceSource(source)) {
    return prepareInterface(source, renderableContentConverter, codeBlockConverter);
  }
}

function prepareEnum(source: EnumSource, renderableContentConverter: ConvertRenderableContentsToString) {
  return {
    ...source,
    values: source.values.map((value) => ({
      value: value.value,
      description: renderableContentConverter(value.description),
    })),
    description: renderableContentConverter(source.description),
  };
}

function prepareInterface(
  source: InterfaceSource,
  renderableContentConverter: ConvertRenderableContentsToString,
  codeBlockConverter: (language: string, lines: string[]) => string,
) {
  return {
    ...source,
    description: renderableContentConverter(source.description),
    mermaid: source.mermaid ? codeBlockConverter('mermaid', source.mermaid) : undefined,
  };
}

function isEnumSource(source: EnumSource | InterfaceSource): source is EnumSource {
  return source.__type === 'enum';
}

function isInterfaceSource(source: EnumSource | InterfaceSource): source is InterfaceSource {
  return source.__type === 'interface';
}
