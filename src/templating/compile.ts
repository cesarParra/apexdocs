import { compile as handlebars } from 'handlebars';
import { RenderableContent, EnumSource, Link } from './types';

export function compile(template: string, source: EnumSource) {
  const prepared = prepare(source);
  const compiled = handlebars(template);
  return compiled(prepared);
}

function prepare(source: EnumSource) {
  return {
    name: source.name,
    values: source.values.map((value) => ({
      value: value.value,
      description: prepareDescription(value.description),
    })),
    description: prepareDescription(source.description),
    sees: source.sees,
  };
}

function prepareDescription(description?: RenderableContent[]) {
  if (!description) {
    return '';
  }

  return description.reduce(reduceDescription, '');
}

function reduceDescription(acc: string, curr: RenderableContent) {
  if (typeof curr === 'string') {
    return acc + curr;
  } else {
    return acc + linkToMarkdown(curr);
  }
}

// TODO: Avoid hardcoding markdown things in here. It should be injected
function linkToMarkdown(link: Link) {
  return `[${link.title}](${link.url})`;
}
