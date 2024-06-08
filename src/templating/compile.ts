import Handlebars from 'handlebars';
import { EnumSource, ConvertRenderableContentsToString, InterfaceSource } from './types';
import { splitAndCapitalize } from './helpers';

type CompileOptions = {
  renderableContentConverter: ConvertRenderableContentsToString;
};

export function compile(template: string, source: EnumSource | InterfaceSource, options: CompileOptions) {
  Handlebars.registerHelper('splitAndCapitalize', splitAndCapitalize);
  const prepared = prepare(source, options.renderableContentConverter);
  const compiled = Handlebars.compile(template);
  return (
    compiled(prepared)
      .trim()
      // clean up extra newlines
      .replace(/\n{3,}/g, '\n\n')
  );
}

function prepare(source: EnumSource | InterfaceSource, renderableContentConverter: ConvertRenderableContentsToString) {
  if (isEnumSource(source)) {
    return prepareEnum(source, renderableContentConverter);
  } else if (isInterfaceSource(source)) {
    return prepareInterface(source);
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

function prepareInterface(source: InterfaceSource) {
  return {
    ...source,
  };
}

function isEnumSource(source: EnumSource | InterfaceSource): source is EnumSource {
  return source.__type === 'enum';
}

function isInterfaceSource(source: EnumSource | InterfaceSource): source is InterfaceSource {
  return source.__type === 'interface';
}
