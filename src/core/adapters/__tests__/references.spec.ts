import { replaceInlineReferences } from '../references';
import { Link } from '../types';

function getFileLink(typeName: string): Link {
  return {
    __type: 'link' as const,
    title: typeName,
    url: `/api/${typeName}.html`,
  };
}

function getEmailLink(typeName: string) {
  return {
    __type: 'link' as const,
    title: typeName,
    url: `mailto:${typeName}`,
  };
}

describe('reference utilities', () => {
  it('returns a RenderableContent array with the full string when there are no links', () => {
    const text = 'This is a test';
    const result = replaceInlineReferences(text, getFileLink, getEmailLink);

    const expected = ['This is a test'];

    expect(result).toEqual(expected);
  });

  describe('replace inline links', () => {
    it('replaces links in the format of <<ClassName>>', () => {
      const text = 'This is a test <<ClassName>>.';
      const result = replaceInlineReferences(text, getFileLink, getEmailLink);

      const expected = [
        'This is a test ',
        {
          __type: 'link',
          title: 'ClassName',
          url: '/api/ClassName.html',
        },
        '.',
      ];

      expect(result).toEqual(expected);
    });
    it('replaces links in the format of {@link ClassName}', () => {
      function getFileLinkByTypeName(typeName: string): Link {
        return {
          __type: 'link' as const,
          title: typeName,
          url: `/api/${typeName}.html`,
        };
      }

      const text = 'This is a test {@link ClassName}';
      const result = replaceInlineReferences(text, getFileLinkByTypeName, getEmailLink);

      const expected = [
        'This is a test ',
        {
          __type: 'link',
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
          __type: 'link' as const,
          title: typeName,
          url: `mailto:${typeName}`,
        };
      }

      const text = 'This is an email {@email example@example.com}';
      const result = replaceInlineReferences(text, getFileLink, getLinkByTypeName);

      const expected = [
        'This is an email ',
        {
          __type: 'link',
          title: 'example@example.com',
          url: 'mailto:example@example.com',
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  it('replaces both links and emails in the same string', () => {
    const text = 'This is a test <<ClassName>>, and {@link AnotherClass}, and an email {@email testerson}';
    const result = replaceInlineReferences(text, getFileLink, getEmailLink);

    const expected = [
      'This is a test ',
      {
        __type: 'link',
        title: 'ClassName',
        url: '/api/ClassName.html',
      },
      ', and ',
      {
        __type: 'link',
        title: 'AnotherClass',
        url: '/api/AnotherClass.html',
      },
      ', and an email ',
      {
        __type: 'link',
        title: 'testerson',
        url: 'mailto:testerson',
      },
    ];

    expect(result).toEqual(expected);
  });
});
