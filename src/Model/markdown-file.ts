import { File } from './file';

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
  }
}
