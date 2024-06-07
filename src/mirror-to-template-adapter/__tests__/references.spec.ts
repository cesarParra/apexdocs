import { replaceInlineEmails, replaceInlineLinks } from '../references';
import { Link } from '../../templating/types';

describe('reference utilities', () => {
  describe('replace inline links', () => {
    it('replaces links in the format of <<ClassName>>', () => {
      function getFileLinkByTypeName(typeName: string): Link {
        return {
          title: typeName,
          url: `/api/${typeName}.html`,
        };
      }

      const text = 'This is a test <<ClassName>>';
      const result = replaceInlineLinks([text], getFileLinkByTypeName);

      const expected = [
        'This is a test ',
        {
          title: 'ClassName',
          url: '/api/ClassName.html',
        },
      ];

      expect(result).toEqual(expected);
    });

    it('replaces links in the format of {@link ClassName}', () => {
      function getFileLinkByTypeName(typeName: string): Link {
        return {
          title: typeName,
          url: `/api/${typeName}.html`,
        };
      }

      const text = 'This is a test {@link ClassName}';
      const result = replaceInlineLinks([text], getFileLinkByTypeName);

      const expected = [
        'This is a test ',
        {
          title: 'ClassName',
          url: '/api/ClassName.html',
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('replace inline emails', () => {
    it('replaces emails in the format of {@email email-address}', () => {
      function getLinkByTypeName(typeName: string) {
        return {
          title: typeName,
          url: `mailto:${typeName}`,
        };
      }

      const text = 'This is an email {@email example@example.com}';
      const result = replaceInlineEmails([text], getLinkByTypeName);

      const expected = [
        'This is an email ',
        {
          title: 'example@example.com',
          url: 'mailto:example@example.com',
        },
      ];

      expect(result).toEqual(expected);
    });
  });
});
