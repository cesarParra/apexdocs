import { encode } from 'html-entities';

export abstract class File {
  _contents = '';

  constructor(public fileName: string, public dir: string) {}

  abstract fileExtension(): string;

  get body() {
    return this._contents;
  }

  addText(text: string, encodeHtml = true) {
    const textToAdd = encodeHtml ? encode(text) : text;
    this._contents += textToAdd;
    this.addBlankLine();
  }

  addBlankLine() {
    this._contents += '\n';
  }
}
