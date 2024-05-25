import parse from '../markdoc-service';

describe('Integration tests', () => {
  it('should parse markdown content', () => {
    const doc = `
# Heading 1

Hello, world!
Hello, world!

> This is a blockquote.

---
`;
    const result = parse(doc);

    expect(result).toBe('# Heading 1\nHello, world!\nHello, world!\n> This is a blockquote.\n---');
  });
});

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

  it('renders blockquotes with multiple lines', () => {
    const content = '> Hello,\n> world!';
    const result = parse(content);

    expect(result).toBe('> Hello,\n> world!');
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
