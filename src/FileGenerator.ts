export default class FileGenerator {
  contents: string = '';

  addBlankLine() {
    this.contents += '\r\n';
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
}
