export abstract class OutputFile {
  _contents = '';

  constructor(public fileName: string, public dir: string) {}

  abstract fileExtension(): string;

  get body() {
    return this._contents;
  }

  addText(text: string) {
    this._contents += text;
    this.addBlankLine();
  }

  addBlankLine() {
    this._contents += '\n';
  }
}
