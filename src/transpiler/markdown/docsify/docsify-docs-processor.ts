import { MarkdownTranspilerBase } from '../markdown-transpiler-base';

export default class DocsifyDocsProcessor extends MarkdownTranspilerBase {
  homeFileName(): string {
    return 'README';
  }
}
