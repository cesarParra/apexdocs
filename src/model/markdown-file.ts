import { File } from './file';
import ClassFileGeneratorHelper from '../transpiler/markdown/class-file-generatorHelper';

export class MarkdownFile extends File {
  fileExtension(): string {
    return '.md';
  }

  addTitle(text: string, level = 1) {
    let title = '';
    for (let i = 0; i < level; i++) {
      title += '#';
    }

    title += ' ';
    title += text;
    this._contents += title;
    this.addBlankLine();
  }

  public addText(text: string, encodeHtml = true) {
    text = MarkdownFile.replaceInlineLinks(text);
    text = MarkdownFile.replaceInlineEmails(text);
    super.addText(text, encodeHtml);
  }

  startCodeBlock() {
    this._contents += '```';
    const sourceLanguage = 'apex';
    this._contents += sourceLanguage;
    this.addBlankLine();
  }

  endCodeBlock() {
    this._contents += '```';
    this.addBlankLine();
  }

  addHorizontalRule() {
    this._contents += '---';
    this.addBlankLine();
  }

  initializeTable(...headers: string[]) {
    this._contents += '|';
    headers.forEach((header) => {
      this._contents += header + '|';
    });
    this.addBlankLine();
    this._contents += '|';
    headers.forEach((_) => {
      this._contents += '---' + '|';
    });
    this.addBlankLine();
  }

  addTableRow(...columns: string[]) {
    this._contents += '|';
    columns.forEach((column) => {
      this._contents += column + '|';
    });
    this.addBlankLine();
  }

  addListItem(text: string) {
    this._contents += `* ${text}`;
  }

  protected static replaceInlineLinks(text: string) {
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

  protected static replaceInlineEmails(text: string) {
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
}
