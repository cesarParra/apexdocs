import DocsifyDocsProcessor from './DocsifyDocsProcessor';

test('that the home file name is README', () => {
  const processor = new DocsifyDocsProcessor();
  expect(processor.getHomeFileName()).toBe('README.md');
});
