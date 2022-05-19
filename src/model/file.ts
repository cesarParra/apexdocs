import xss = require('xss');

const xssFilter = new xss.FilterXSS({
  whiteList: { br: [], p: [], ul: [], li: [] },
});

export abstract class File {
  _contents = '';

  constructor(public fileName: string, public dir: string) {}

  abstract fileExtension(): string;

  get body() {
    return this._contents;
  }

  addText(text: string, encodeHtml = true) {
    const textToAdd = encodeHtml ? xssFilter.process(text) : text;
    this._contents += textToAdd;
    this.addBlankLine();
  }

  addBlankLine() {
    this._contents += '\n';
  }
}
