import { encode } from 'html-entities';

import ClassModel from './model/ClassModel';
import ClassFileGeneratorHelper from './ClassFileGeneratorHelper';
import Configuration from './Configuration';

export default class MarkdownHelper {
  contents: string = '';
  classes: ClassModel[];

  constructor(classes: ClassModel[]) {
    this.classes = classes;
  }

  addBlankLine() {
    this.contents += '\n';
  }

  addTitle(text: string, level: number = 1) {
    let title = '';
    for (let i = 0; i < level; i++) {
      title += '#';
    }

    title += ' ';
    title += text;
    this.contents += title;
    this.addBlankLine();
  }

  addText(text: string, encodeHtml: boolean = true) {
    // Parsing text to extract possible linking classes.
    const possibleLinks = text.match(/<<.*?>>/g);
    possibleLinks?.forEach(currentMatch => {
      const classNameForMatch = currentMatch.replace('<<', '').replace('>>', '');
      this.classes.forEach(classModel => {
        if (classModel.getClassName() === classNameForMatch) {
          text = text.replace(currentMatch, ClassFileGeneratorHelper.getFileLink(classModel, true));
        }
      });
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
      this.classes.forEach(classModel => {
        if (classModel.getClassName() === currentMatch[1]) {
          text = text.replace(currentMatch[0], ClassFileGeneratorHelper.getFileLink(classModel, true));
        }
      });
    }

    const textToAdd = encodeHtml ? encode(text) : text;
    this.contents += textToAdd;
    this.addBlankLine();
  }

  addHorizontalRule() {
    this.contents += '---';
    this.addBlankLine();
  }

  addLink(title: string, url: string) {
    this.contents += `[${title}](${url})`;
  }

  startCodeBlock() {
    this.contents += '```';
    const sourceLanguage = Configuration.getConfig()?.sourceLanguage;
    if (sourceLanguage) {
      this.contents += sourceLanguage;
    }
    this.addBlankLine();
  }

  endCodeBlock() {
    this.contents += '```';
    this.addBlankLine();
  }
}
