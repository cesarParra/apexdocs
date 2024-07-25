import { CodeBlock, EmptyLine, RenderableContent } from './types';

export function isEmptyLine(content: RenderableContent): content is EmptyLine {
  return Object.keys(content).includes('__type') && (content as { __type: string }).__type === 'empty-line';
}

export function isCodeBlock(content: RenderableContent): content is CodeBlock {
  return Object.keys(content).includes('__type') && (content as { __type: string }).__type === 'code-block';
}
