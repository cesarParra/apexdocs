import JekyllDocsProcessor from './JekyllDocsProcessor';
import MarkdownHelper from './MarkdownHelper';

test('that home file is index.md', () => {
  const processor = new JekyllDocsProcessor();

  expect(processor.getHomeFileName()).toBe('index.md');
});

test('that onBeforeHomeFileCreated adds front matter', () => {
  const markdownHelper = jest.genMockFromModule('./MarkdownHelper') as MarkdownHelper;
  markdownHelper.addText = jest.fn();

  const processor = new JekyllDocsProcessor();
  processor.onBeforeHomeFileCreated(markdownHelper);

  expect(markdownHelper.addText).toHaveBeenCalledTimes(3);
});

test('that onBeforeClassFileCreated adds front matter', () => {
  const markdownHelper = jest.genMockFromModule('./MarkdownHelper') as MarkdownHelper;
  markdownHelper.addText = jest.fn();

  const processor = new JekyllDocsProcessor();
  processor.onBeforeClassFileCreated(markdownHelper);

  expect(markdownHelper.addText).toHaveBeenCalledTimes(3);
});
