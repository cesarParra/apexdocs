import { MarkdownTranspilerBase } from '../markdown-transpiler-base';
import { LinkingStrategy } from '../../processor-type-transpiler';

export default class DocsifyDocsProcessor extends MarkdownTranspilerBase {
  homeFileName(): string {
    return 'README';
  }

  getLinkingStrategy(): LinkingStrategy {
    return 'root-relative';
  }
}
