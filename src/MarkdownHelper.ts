import ClassModel from './model/ClassModel';
import ClassFileGeneratorHelper from './ClassFileGeneratorHelper';

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

  addText(text: string) {
    // Parsing text to extract possible linking classes.
    const possibleLinks = text.match(/<<.*?>>/g);
    possibleLinks?.forEach(currentMatch => {
      const classNameForMatch = currentMatch.replace('<<', '').replace('>>', '');
      this.classes.forEach(classModel => {
        if (classModel.getClassName() === classNameForMatch) {
          text = text.replace(currentMatch, ClassFileGeneratorHelper.getFileLink(classModel));
        }
      });
    });

    this.contents += text;
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
    this.addBlankLine();
  }

  endCodeBlock() {
    this.contents += '```';
    this.addBlankLine();
  }
}
