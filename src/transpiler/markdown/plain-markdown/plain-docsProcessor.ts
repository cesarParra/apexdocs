import { MarkdownTranspilerBase } from '../markdown-transpiler-base';
import { LinkingStrategy } from '../../processor-type-transpiler';

export class PlainMarkdownDocsProcessor extends MarkdownTranspilerBase {
  homeFileName(): string {
    return 'index';
  }

  getLinkingStrategy(): LinkingStrategy {
    return 'path-relative';
  }
}
