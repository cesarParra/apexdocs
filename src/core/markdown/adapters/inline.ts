import { InlineCode, Link, RenderableContent } from './types';
import { pipe } from 'fp-ts/function';
import { apply } from '../../../util/fp';

type InlineRenderableContent = InlineCode | Link | string;

type ToInlineRenderableContent = (typeName: string) => InlineRenderableContent;

function defaultGetEmailByReference(email: string): Link {
  return {
    __type: 'link',
    title: email,
    url: `mailto:${email}`,
  };
}

export function replaceInlineReferences(
  text: string,
  linkReplacer: ToInlineRenderableContent,
  emailReplacer: ToInlineRenderableContent = defaultGetEmailByReference,
): RenderableContent[] {
  const inlineLinks = apply(replaceInlineLinks, linkReplacer);
  const inlineEmails = apply(replaceInlineEmails, emailReplacer);

  return pipe(inlineCode([text]), inlineLinks, inlineEmails);
}

function inlineCode(renderableContents: RenderableContent[]): RenderableContent[] {
  return renderableContents.flatMap((renderableContent) => inlineCodeContent(renderableContent));
}

// Replace string that is inline code with InlineCode
// Inline code is any text that backticks surround
function inlineCodeContent(renderableContent: RenderableContent): RenderableContent[] {
  if (typeof renderableContent !== 'string') {
    return [renderableContent];
  }

  function inlineCodeLink(text: string): InlineCode {
    return {
      __type: 'inline-code',
      content: text,
    };
  }

  const text = renderableContent;

  // Matches any text surrounded by backticks
  const codeFormatRegEx = '`([^`]*)`';
  const matches = match(codeFormatRegEx, text);
  return createRenderableContents(matches, text, inlineCodeLink);
}

function replaceInlineLinks(
  getLinkByTypeName: ToInlineRenderableContent,
  renderableContents: RenderableContent[],
): RenderableContent[] {
  return renderableContents.flatMap((renderableContent) => inlineLinkContent(renderableContent, getLinkByTypeName));
}

function inlineLinkContent(
  renderableContent: RenderableContent,
  getLinkByTypeName: ToInlineRenderableContent,
): RenderableContent[] {
  if (typeof renderableContent !== 'string') {
    return [renderableContent];
  }

  const text = renderableContent;

  // Matches either `<<ClassName>>` or `{@link ClassName}`
  const linkFormatRegEx = '{@link (.*?)}|<<([^>]+)>>';
  const matches = match(linkFormatRegEx, text);
  return createRenderableContents(matches, text, getLinkByTypeName);
}

export function replaceInlineEmails(
  getLinkByTypeName: ToInlineRenderableContent,
  renderableContents: RenderableContent[],
): RenderableContent[] {
  return renderableContents.flatMap((renderableContent) => inlineEmailContent(renderableContent, getLinkByTypeName));
}

function inlineEmailContent(
  renderableContent: RenderableContent,
  getLinkByTypeName: ToInlineRenderableContent,
): RenderableContent[] {
  if (typeof renderableContent !== 'string') {
    return [renderableContent];
  }

  const text = renderableContent;

  // Parsing references using the format '{@email email}'
  const linkFormatRegEx = '{@email (.*?)}';
  const matches = match(linkFormatRegEx, text);
  return createRenderableContents(matches, text, getLinkByTypeName);
}

function match(regex: string, text: string) {
  const expression = new RegExp(regex, 'gi');
  let match;
  const matches = [];

  do {
    match = expression.exec(text);
    if (match) {
      matches.push(match);
    }
  } while (match);

  return matches;
}

function createRenderableContents(matches: RegExpExecArray[], text: string, linker: ToInlineRenderableContent) {
  if (matches.length === 0) {
    return [text];
  }

  const result: RenderableContent[] = [];
  let lastIndex = 0;
  for (const match of matches) {
    const index = match.index;
    const length = match[0].length;

    // loop through the matches (skip the first one, which is the full match)
    // until we find the first capturing group that has a value
    const capturedGroup = match.slice(1).find((group) => group);
    if (!capturedGroup) {
      continue;
    }
    result.push(text.slice(lastIndex, index));
    result.push(linker(capturedGroup));

    lastIndex = index + length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}
