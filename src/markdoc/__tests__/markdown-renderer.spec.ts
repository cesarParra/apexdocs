import parse from '../markdoc-service';

describe('Markdown Renderer', () => {
  it('renders headings as headings', () => {
    const content = '# Heading 1';
    const result = parse(content);

    expect(result).toBe('# Heading 1');
  });

  it('renders headings of different levels', () => {
    const content = '## Heading 2';
    const result = parse(content);

    expect(result).toBe('## Heading 2');
  });
});

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
