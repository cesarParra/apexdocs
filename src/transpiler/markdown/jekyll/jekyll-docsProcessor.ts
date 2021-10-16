// import MarkdownDocsProcessor from '../markdown-docs-processor';
// import MarkdownHelper from '../markdown-helper';
//
// export default class JekyllDocsProcessor extends MarkdownDocsProcessor {
//   getHomeFileName(): string {
//     return 'index.md';
//   }
//
//   onBeforeHomeFileCreated(generator: MarkdownHelper) {
//     this.addFrontMatterHeader(generator);
//   }
//
//   onBeforeClassFileCreated(generator: MarkdownHelper) {
//     this.addFrontMatterHeader(generator);
//   }
//
//   private addFrontMatterHeader(generator: MarkdownHelper) {
//     generator.addText('---');
//     generator.addText('layout: default');
//     generator.addText('---');
//   }
// }
