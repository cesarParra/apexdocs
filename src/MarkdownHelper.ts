export default class MarkdownHelper {
  contents: string = '';

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
  }

  endCodeBlock() {
    this.contents += '```';
  }
}
