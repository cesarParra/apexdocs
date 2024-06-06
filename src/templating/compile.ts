import * as handlebars from 'handlebars';
import { EnumSource, Link } from './types';

export function compile(template: string, source: EnumSource) {
  const prepared = prepare(source);
  const compiled = handlebars.compile(template);
  return compiled(prepared);
}

function prepare(source: EnumSource) {
  return {
    name: source.name,
    description: source.description?.reduce((acc, curr) => {
      if (typeof curr === 'string') {
        return acc + curr;
      } else {
        return acc + linkToMarkdown(curr);
      }
    }, ''),
  };
}

function linkToMarkdown(link: Link) {
  return `[${link.title}](${link.url})`;
}
