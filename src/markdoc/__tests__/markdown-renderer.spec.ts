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

  it('renders a table of contents with grouped class names', () => {
    const content = '{% table-of-contents /%}';
    const classInfo = {
      Core: [
        {
          name: 'AccountService',
          url: 'https://example.com/account-service',
          description: 'Service for managing accounts',
        },
        {
          name: 'UserService',
          url: 'https://example.com/user-service',
        },
      ],
      Utilities: [
        {
          name: 'StringUtils',
          url: 'https://example.com/string-utils',
        },
      ],
    };

    const result = parse(content, classInfo);

    const expected = `## Core
- [AccountService](https://example.com/account-service)
Service for managing accounts
- [UserService](https://example.com/user-service)

## Utilities
- [StringUtils](https://example.com/string-utils)
`;

    expect(result).toBe(expected);
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
