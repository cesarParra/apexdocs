import { compile as handlebars } from 'handlebars';
import { RenderableContent, EnumSource, Link, ConvertRenderableContentsToString } from './types';

type CompileOptions = {
  renderableContentConverter: ConvertRenderableContentsToString;
};

export function compile(template: string, source: EnumSource, options: CompileOptions) {
  const prepared = prepare(source, options.renderableContentConverter);
  const compiled = handlebars(template);
  return compiled(prepared).trim();
}

function prepare(source: EnumSource, renderableContentConverter: ConvertRenderableContentsToString) {
  return {
    name: source.name,
    values: source.values.map((value) => ({
      value: value.value,
      description: renderableContentConverter(value.description),
    })),
    description: renderableContentConverter(source.description),
    sees: source.sees,
  };
}
