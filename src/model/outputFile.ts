import xss = require('xss');
import { Settings } from '../settings';

// TODO: Remove xssFilter from the list of dependencies
const xssFilter = new xss.FilterXSS({
  whiteList: { br: [], p: [], ul: [], li: [], code: [], pre: [] },
});

export abstract class OutputFile {
  _contents = '';

  constructor(public fileName: string, public dir: string) {}

  abstract fileExtension(): string;

  get body() {
    return this._contents;
  }

  addText(text: string, encodeHtml = true) {
    //const shouldEncode = encodeHtml && Settings.getInstance().sanitizeHtml;
    //const textToAdd = shouldEncode ? xssFilter.process(text) : text;
    this._contents += text;
    this.addBlankLine();
  }

  addBlankLine() {
    this._contents += '\n';
  }
}
