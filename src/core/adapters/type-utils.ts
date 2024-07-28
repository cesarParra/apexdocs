import { CodeBlock, EmptyLine, InlineCode, RenderableContent } from './types';

export function isEmptyLine(content: RenderableContent): content is EmptyLine {
  return Object.keys(content).includes('__type') && (content as { __type: string }).__type === 'empty-line';
}

export function isCodeBlock(content: RenderableContent): content is CodeBlock {
  return Object.keys(content).includes('__type') && (content as { __type: string }).__type === 'code-block';
}

export function isInlineCode(content: RenderableContent): content is InlineCode {
  return Object.keys(content).includes('__type') && (content as { __type: string }).__type === 'inline-code';
}
