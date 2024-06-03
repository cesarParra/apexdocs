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

  it('renders blockquotes with multiple lines', () => {
    const content = '> Hello,\n> world!';
    const result = parse(content);

    expect(result).toBe('> Hello,\n> world!');
  });

  it('renders fences', () => {
    const content = '```js\nconsole.log("Hello, world!");\n```';
    const result = parse(content);

    expect(result).toBe('```js\nconsole.log("Hello, world!");\n```');
  });

  it('renders unordered lists', () => {
    const content = '- Hello, world!\n - Another item';
    const result = parse(content);

    expect(result).toBe('- Hello, world!\n- Another item');
  });

  it('renders ordered lists', () => {
    const content = '1. Hello, world!\n 2. Another item';
    const result = parse(content);

    expect(result).toBe('1. Hello, world!\n2. Another item');
  });
});

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
