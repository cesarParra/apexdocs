import parse from '../markdoc-service';

describe('Markdown Renderer', () => {
  it('renders headings as headings', () => {
    const content = '# Heading 1';
    const result = parse(content);

    expect(result).toBe('# Heading 1');
  });
});

// TODO: Headings of different levels
// Paragraphs
// HRs
// blockquotes
// fence (``` blocks)
// lists
// item
// table
// thead
// tbody
// tr
// td
// th
// inline
// strong
// em
// s
// link
// code
// text
// hardbreak
// softbreak
