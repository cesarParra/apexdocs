import MarkdownDocsProcessor from './MarkdownDocsProcessor';

export default class DocsifyDocsProcessor extends MarkdownDocsProcessor {
  getHomeFileName(): string {
    return 'README.md';
  }
}
