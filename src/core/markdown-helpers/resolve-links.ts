import { RenderableContent, StringOrLink } from '../../templating/types';
import { isEmptyLine } from '../../adapters/type-utils';

export function resolveLinksInContent(description?: RenderableContent[]): string {
  if (!description) {
    return '';
  }

  function reduceDescription(acc: string, curr: RenderableContent) {
    if (isEmptyLine(curr)) {
      return acc + '\n\n';
    }

    return acc + link(curr).trim() + ' ';
  }

  return description.reduce(reduceDescription, '').trim();
}

export function link(source: StringOrLink): string {
  if (typeof source === 'string') {
    return source;
  } else {
    return `[${source.title}](${source.url})`;
  }
}
