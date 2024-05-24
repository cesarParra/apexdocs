import Markdoc from '@cparra/markdoc';

export class MarkdocService {
  static parse(markdown: string) {
    const ast = Markdoc.parse(markdown);
    return Markdoc.transform(ast);
  }
}

console.log('hello');
