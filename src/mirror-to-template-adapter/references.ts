import ClassFileGeneratorHelper from '../transpiler/markdown/class-file-generatorHelper';
import { Link, RenderableContent } from '../templating/types';

export type GetLinkByTypeName = (typeName: string) => Link;

export const linkFromTypeNameGenerator: GetLinkByTypeName = ClassFileGeneratorHelper.getRenderableLinkByTypeName;

function defaultGetEmailByReference(email: string): Link {
  return {
    title: email,
    url: `mailto:${email}`,
  };
}

export function replaceInlineReferences(
  text: string,
  linkReplacer: GetLinkByTypeName = linkFromTypeNameGenerator,
  emailReplacer: GetLinkByTypeName = defaultGetEmailByReference,
): RenderableContent[] {
  return replaceInlineEmails(replaceInlineLinks([text], linkReplacer), emailReplacer);
}

function replaceInlineLinks(
  renderableContents: RenderableContent[],
  getLinkByTypeName: GetLinkByTypeName,
): RenderableContent[] {
  return renderableContents.flatMap((renderableContent) => inlineLinkContent(renderableContent, getLinkByTypeName));
}

function inlineLinkContent(
  renderableContent: RenderableContent,
  getLinkByTypeName: GetLinkByTypeName,
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
  renderableContents: RenderableContent[],
  getLinkByTypeName: GetLinkByTypeName,
): RenderableContent[] {
  return renderableContents.flatMap((renderableContent) => inlineEmailContent(renderableContent, getLinkByTypeName));
}

function inlineEmailContent(
  renderableContent: RenderableContent,
  getLinkByTypeName: GetLinkByTypeName,
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

function createRenderableContents(matches: RegExpExecArray[], text: string, linker: GetLinkByTypeName) {
  if (matches.length === 0) {
    return [text];
  }

  const result: RenderableContent[] = [];
  let lastIndex = 0;
  for (const match of matches) {
    // split the string into the part before the match, then the match, then everything after the match
    // using the index property of the match to get where to split it, and the length of the match to get the end of the match
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
