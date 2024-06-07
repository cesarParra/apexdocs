import ClassFileGeneratorHelper from '../transpiler/markdown/class-file-generatorHelper';

// TODO: Unit test
// TODO: JS Docs
export function replaceInlineReferences(text: string): string {
  text = replaceInlineLinks(text);
  text = replaceInlineEmails(text);
  return text;
}

// TODO: Unit test
// TODO: JSDocs
export function replaceInlineLinks(text: string) {
  // Parsing text to extract possible linking classes.
  const possibleLinks = text.match(/<<.*?>>/g);
  possibleLinks?.forEach((currentMatch) => {
    const classNameForMatch = currentMatch.replace('<<', '').replace('>>', '');
    text = text.replace(currentMatch, ClassFileGeneratorHelper.getFileLinkByTypeName(classNameForMatch));
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
    text = text.replace(currentMatch[0], ClassFileGeneratorHelper.getFileLinkByTypeName(currentMatch[1]));
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
