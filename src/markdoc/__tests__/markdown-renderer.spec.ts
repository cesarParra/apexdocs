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

  it('renders paragraphs', () => {
    const content = 'Hello, world!';
    const result = parse(content);

    expect(result).toBe('Hello, world!');
  });

  it('renders paragraphs with multiple lines', () => {
    const content = 'Hello,\nworld!';
    const result = parse(content);

    expect(result).toBe('Hello,\nworld!');
  });

  it('renders horizontal rules', () => {
    const content = '---';
    const result = parse(content);

    expect(result).toBe('---');
  });

  it('renders blockquotes', () => {
    const content = '> Hello, world!';
    const result = parse(content);

    expect(result).toBe('> Hello, world!');
  });
});

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
