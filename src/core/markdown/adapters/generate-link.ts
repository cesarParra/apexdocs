import { StringOrLink } from '../../renderables/types';
import path from 'path';
import { LinkingStrategy } from '../../shared/types';

export type LinkingStrategyFn = (
  references: Record<string, { referencePath: string; displayName: string } | undefined>,
  from: string,
  referenceName: string,
) => StringOrLink;

export const generateLink = (strategy: LinkingStrategy): LinkingStrategyFn => {
  const resolveTypeName = getStrategyFn(strategy);
  return (references, from, referenceName) => resolveReference(resolveTypeName, references, from, referenceName);
};

const getStrategyFn = (strategy: LinkingStrategy): LinkingStrategyFn => {
  switch (strategy) {
    case 'relative':
      return generateRelativeLink;
    case 'no-link':
      return generateNoLink;
    case 'none':
      return returnReferenceAsIs;
  }
};

/**
 * Resolves a reference from an `@see` tag or `{@link}` inline tag. Besides
 * plain type names, the reference forms from the ApexDoc specification are
 * supported:
 * - `TypeName#member` or `TypeName#member(paramTypes)`: links to the member's
 *   section within the type's page.
 * - `"text"`: plain text, displayed without the quotes and never linked.
 * - `<a href="URL">label</a>`: an arbitrary URL link.
 */
function resolveReference(
  resolveTypeName: LinkingStrategyFn,
  references: Record<string, { referencePath: string; displayName: string } | undefined>,
  from: string,
  referenceName: string,
): StringOrLink {
  const reference = referenceName.trim();

  const quotedText = reference.match(/^"([\s\S]*)"$/);
  if (quotedText) {
    return quotedText[1];
  }

  const htmlAnchor = reference.match(/^<a\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>$/i);
  if (htmlAnchor) {
    return {
      __type: 'link',
      title: htmlAnchor[2].trim(),
      url: htmlAnchor[1],
    };
  }

  const memberReference = reference.match(/^([\w.]*)#([\w.]+(?:\([^)]*\))?)$/);
  if (memberReference) {
    const [, typeName, member] = memberReference;
    // Anchor for the member's heading within the page. Headings for members
    // with parameters include the parameter names, so for those the anchor is
    // a best-effort approximation that at least lands on the right page.
    const anchor = member.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!typeName) {
      // A same-page reference, e.g. `#myMethod()`
      return {
        __type: 'link',
        title: member,
        url: `#${anchor}`,
      };
    }
    const resolvedType = resolveTypeName(references, from, typeName);
    if (typeof resolvedType === 'string') {
      // The type could not be linked; degrade to plain text.
      return reference;
    }
    return {
      __type: 'link',
      title: `${resolvedType.title}.${member}`,
      url: `${resolvedType.url}#${anchor}`,
    };
  }

  return resolveTypeName(references, from, reference);
}

const generateRelativeLink = (
  references: Record<string, { referencePath: string; displayName: string } | undefined>,
  from: string, // The name of the file for which the reference is being generated
  referenceName: string,
): StringOrLink => {
  function getRelativePath(fromPath: string, toPath: string) {
    return path.relative(path.parse(path.join('/', fromPath)).dir, path.join('/', toPath));
  }

  const referenceTo = references[referenceName];
  if (!referenceTo) {
    return referenceName;
  }
  // When linking from the base path (e.g. the reference guide/index page), the reference path is the same as the output
  // path.
  if (referenceTo && from === '__base__') {
    return {
      __type: 'link',
      title: referenceTo.displayName,
      url: getRelativePath('', referenceTo.referencePath),
    };
  }

  const referenceFrom = references[from];

  if (!referenceFrom) {
    return referenceTo.displayName;
  }

  return {
    __type: 'link',
    title: referenceTo.displayName,
    url: getRelativePath(referenceFrom.referencePath, referenceTo.referencePath),
  };
};

const generateNoLink = (
  references: Record<string, { referencePath: string; displayName: string } | undefined>,
  _from: string,
  referenceName: string,
): StringOrLink => {
  const referenceTo = references[referenceName];
  return referenceTo ? referenceTo.displayName : referenceName;
};

const returnReferenceAsIs = (
  references: Record<string, { referencePath: string; displayName: string } | undefined>,
  _from: string,
  referenceName: string,
): StringOrLink => {
  const referenceTo = references[referenceName];
  if (!referenceTo) {
    return referenceName;
  }

  return {
    __type: 'link',
    title: referenceTo.displayName,
    url: referenceTo.referencePath,
  };
};
