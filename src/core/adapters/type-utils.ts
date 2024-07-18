import { EmptyLine, RenderableContent } from './types';

export function isEmptyLine(content: RenderableContent): content is EmptyLine {
  return Object.keys(content).includes('type') && (content as { type: string }).type === 'empty-line';
}
