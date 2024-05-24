import { MarkdocService } from './markdoc-service';

describe('MarkdocService', () => {
  it('should parse markdown and log the output', () => {
    const markdown = '# Hello, World!';
    const ast = MarkdocService.parse(markdown);
    console.log(ast);
    expect(ast).toBeTruthy();
  });
});
