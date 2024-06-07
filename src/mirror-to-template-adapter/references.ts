import ClassFileGeneratorHelper from '../transpiler/markdown/class-file-generatorHelper';
import { Link, RenderableContent } from '../templating/types';

export type GetLinkByTypeName = (typeName: string) => Link;

const defaultLinkReplacer: GetLinkByTypeName = ClassFileGeneratorHelper.getRenderableLinkByTypeName;

function defaultGetEmailByReference(email: string): Link {
  return {
    title: email,
    url: `mailto:${email}`,
  };
}

export function replaceInlineReferences(
  text: string,
  linkReplacer: GetLinkByTypeName = defaultLinkReplacer,
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

  if (matches.length === 0) {
    return [text];
  }

  const result: RenderableContent[] = [];
  let lastIndex = 0;
  for (const currentMatch of matches) {
    const typeName = currentMatch[1] || currentMatch[2];
    result.push(text.slice(lastIndex, currentMatch.index));
    result.push(getLinkByTypeName(typeName));

    lastIndex = currentMatch.index + currentMatch[0].length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
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

  // Parsing links using {@link ClassName} format
  const linkFormatRegEx = '{@email (.*?)}';
  const matches = match(linkFormatRegEx, text);

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

    result.push(text.slice(lastIndex, index));
    result.push(getLinkByTypeName(match[1]));

    lastIndex = index + length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
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
