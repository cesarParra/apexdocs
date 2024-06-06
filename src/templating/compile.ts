import * as handlebars from 'handlebars';
import { DescriptionContent, EnumSource, Link } from './types';

export function compile(template: string, source: EnumSource) {
  const prepared = prepare(source);
  const compiled = handlebars.compile(template);
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
  };
}

function prepareDescription(description?: DescriptionContent[]) {
  if (!description) {
    return '';
  }

  return description.reduce(reduceDescription, '');
}

function reduceDescription(acc: string, curr: DescriptionContent) {
  if (typeof curr === 'string') {
    return acc + curr;
  } else {
    return acc + linkToMarkdown(curr);
  }
}

function linkToMarkdown(link: Link) {
  return `[${link.title}](${link.url})`;
}
