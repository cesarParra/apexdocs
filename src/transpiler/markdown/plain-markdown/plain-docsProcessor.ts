import { LinkingStrategy, MarkdownTranspilerBase } from '../markdown-transpiler-base';

export class PlainMarkdownDocsProcessor extends MarkdownTranspilerBase {
  homeFileName(): string {
    return 'index';
  }

  getLinkingStrategy(): LinkingStrategy {
    return 'path-relative';
  }
}
