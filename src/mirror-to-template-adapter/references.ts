import ClassFileGeneratorHelper from '../transpiler/markdown/class-file-generatorHelper';

// TODO: Unit test
// TODO: JS Docs
export function replaceInlineReferences(text: string): string {
  text = replaceInlineLinks(text);
  text = replaceInlineEmails(text);
  return text;
}

// TODO: What this should return is some kind of RenderableText, which is a list of string | Link
// then we can give the concern of how to render that to someone else. That way it is easier
// to have different implementations of how links (and other things) are rendered.
type GetFileLinkByTypeName = (typeName: string) => string;

/**
 * Replaces inline links in the format of `<<ClassName>>` and `{@link ClassName}` with the corresponding
 * file link.
 * @param text The text to replace the links in.
 * @param getFileLinkByTypeName A function that returns the file link for a given type name.
 */
export function replaceInlineLinks(
  text: string,
  getFileLinkByTypeName: GetFileLinkByTypeName = ClassFileGeneratorHelper.getFileLinkByTypeName,
): string {
  // Parsing text to extract possible linking classes.
  const possibleLinks = text.match(/<<.*?>>/g);
  possibleLinks?.forEach((currentMatch) => {
    const classNameForMatch = currentMatch.replace('<<', '').replace('>>', '');
    text = text.replace(currentMatch, getFileLinkByTypeName(classNameForMatch));
  });

  // Parsing links using {@link ClassName} format
  const linkFormatRegEx = '{@link (.*?)}';
  const expression = new RegExp(linkFormatRegEx, 'gi');
  let match;
  const matches = [];

  do {
    match = expression.exec(text);
    if (match) {
      matches.push(match);
    }
  } while (match);

  for (const currentMatch of matches) {
    text = text.replace(currentMatch[0], getFileLinkByTypeName(currentMatch[1]));
  }
  return text;
}

// TODO: Unit test
// TODO: JSDocs
export function replaceInlineEmails(text: string) {
  // Parsing links using {@link ClassName} format
  const linkFormatRegEx = '{@email (.*?)}';
  const expression = new RegExp(linkFormatRegEx, 'gi');
  let match;
  const matches = [];

  do {
    match = expression.exec(text);
    if (match) {
      matches.push(match);
    }
  } while (match);

  for (const currentMatch of matches) {
    text = text.replace(currentMatch[0], `[${currentMatch[1]}](mailto:${currentMatch[1]})`);
  }
  return text;
}
