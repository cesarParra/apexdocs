import parse from '../markdoc-service';
import { Manifest } from '../types';

describe('Markdown Renderer', () => {
  it('renders a table of contents with grouped class names', () => {
    const content = '{% table-of-contents /%}';
    const manifest = {
      files: [
        {
          name: 'AccountService',
          url: 'https://example.com/account-service',
          descriptionNodes: ['Service for managing accounts'],
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
          descriptionNodes: ['Service for managing accounts'],
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

  it('can receive a custom name for ungrouped classes', () => {
    const content = '{% table-of-contents default-group-name="Custom" /%}';
    const manifest = {
      files: [
        {
          name: 'AccountService',
          url: 'https://example.com/account-service',
          descriptionNodes: ['Service for managing accounts'],
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

## Custom
- [StringUtils](https://example.com/string-utils)
`;

    expect(result).toBe(expected);
  });

  it('can be be configured to not display any groups', () => {
    const content = '{% table-of-contents disable-grouping=true /%}';
    const manifest = {
      files: [
        {
          name: 'AccountService',
          url: 'https://example.com/account-service',
          descriptionNodes: ['Service for managing accounts'],
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

    const expected = `- [AccountService](https://example.com/account-service)
Service for managing accounts
- [UserService](https://example.com/user-service)
- [StringUtils](https://example.com/string-utils)`;

    expect(result).toBe(expected);
  });

  it('can render descriptions with links', () => {
    const content = '{% table-of-contents /%}';
    const manifest: Manifest = {
      files: [
        {
          name: 'AccountService',
          url: 'https://example.com/account-service',
          descriptionNodes: [
            'Service for managing accounts',
            { type: 'link', url: 'https://example.com/docs', title: 'Docs' },
          ],
          group: 'Core',
        },
      ],
    };

    const result = parse(content, manifest);

    const expected = `## Core
- [AccountService](https://example.com/account-service)
Service for managing accounts[Docs](https://example.com/docs)
`;

    expect(result).toBe(expected);
  });
});
