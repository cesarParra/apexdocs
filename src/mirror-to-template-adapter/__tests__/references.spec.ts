import { replaceInlineEmails, replaceInlineLinks } from '../references';

describe('reference utilities', () => {
  describe('replace inline links', () => {
    it('replaces links in the format of <<ClassName>>', () => {
      function getFileLinkByTypeName(typeName: string) {
        return `[ClassName](/api/${typeName}.html)`;
      }

      const text = 'This is a test <<ClassName>>';
      const result = replaceInlineLinks(text, getFileLinkByTypeName);
      expect(result).toBe('This is a test [ClassName](/api/ClassName.html)');
    });

    it('replaces links in the format of {@link ClassName}', () => {
      function getFileLinkByTypeName(typeName: string) {
        return `[ClassName](/api/${typeName}.html)`;
      }

      const text = 'This is a test {@link ClassName}';
      const result = replaceInlineLinks(text, getFileLinkByTypeName);
      expect(result).toBe('This is a test [ClassName](/api/ClassName.html)');
    });
  });

  describe('replace inline emails', () => {
    it('replaces emails in the format of {@email email-address}', () => {
      const text = 'This is an email {@email example@example.com}';
      const result = replaceInlineEmails(text);
      expect(result).toBe('This is an email [example@example.com](mailto:example@example.com)');
    });
  });
});
