import Handlebars from 'handlebars';
import { EnumSource, ConvertRenderableContentsToString } from './types';
import { splitAndCapitalize } from './helpers';

type CompileOptions = {
  renderableContentConverter: ConvertRenderableContentsToString;
};

export function compile(template: string, source: EnumSource, options: CompileOptions) {
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

function prepare(source: EnumSource, renderableContentConverter: ConvertRenderableContentsToString) {
  return {
    ...source,
    values: source.values.map((value) => ({
      value: value.value,
      description: renderableContentConverter(value.description),
    })),
    description: renderableContentConverter(source.description),
  };
}
