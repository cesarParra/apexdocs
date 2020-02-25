export default class MarkdownHelper {
  contents: string = '';

  addBlankLine() {
    this.contents += '\n';
  }

  addTitle(text: string, level: number) {
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
    this.contents += text;
    this.addBlankLine();
  }

  addHorizontalRule() {
    this.contents += '---';
    this.addBlankLine();
  }
}
