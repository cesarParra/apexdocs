import MarkdownDocsProcessor from './../markdown-docs-processor';

export default class DocsifyDocsProcessor extends MarkdownDocsProcessor {
  getHomeFileName(): string {
    return 'README.md';
  }
}
