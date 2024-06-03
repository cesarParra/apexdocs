import parse from '../markdoc-service';

describe('Markdown Renderer', () => {
  it('renders a table of contents with grouped class names', () => {
    const content = '{% table-of-contents /%}';
    const manifest = {
      files: [
        {
          name: 'AccountService',
          url: 'https://example.com/account-service',
          description: 'Service for managing accounts',
          group: 'Core',
        },
        {
          name: 'UserService',
          url: 'https://example.com/user-service',
          group: 'Core',
        },
        {
          name: 'StringUtils',
          url: 'https://example.com/string-utils',
          group: 'Utilities',
        },
      ],
    };

    const result = parse(content, manifest);

    const expected = `## Core
- [AccountService](https://example.com/account-service)
Service for managing accounts
- [UserService](https://example.com/user-service)

## Utilities
- [StringUtils](https://example.com/string-utils)
`;

    expect(result).toBe(expected);
  });

  it('marks ungrouped classes as miscellaneous', () => {
    const content = '{% table-of-contents /%}';
    const manifest = {
      files: [
        {
          name: 'AccountService',
          url: 'https://example.com/account-service',
          description: 'Service for managing accounts',
          group: 'Core',
        },
        {
          name: 'UserService',
          url: 'https://example.com/user-service',
          group: 'Core',
        },
        {
          name: 'StringUtils',
          url: 'https://example.com/string-utils',
        },
      ],
    };

    const result = parse(content, manifest);

    const expected = `## Core
- [AccountService](https://example.com/account-service)
Service for managing accounts
- [UserService](https://example.com/user-service)

## Miscellaneous
- [StringUtils](https://example.com/string-utils)
`;

    expect(result).toBe(expected);
  });
});
