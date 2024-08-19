import { generateLink } from '../generate-link';

describe('Generates links', () => {
  it('generates relative links from the base when found', () => {
    const references = {
      referenceName: {
        referencePath: 'referencePath',
        displayName: 'displayName',
      },
    };
    const from = '__base__';
    const referenceName = 'referenceName';

    const result = generateLink(references, from, referenceName);

    expect(result).toEqual({
      __type: 'link',
      title: 'displayName',
      url: 'referencePath',
    });
  });

  it('returns the name of the reference when not found', () => {
    const references = {};
    const from = '__base__';
    const referenceName = 'referenceName';

    const result = generateLink(references, from, referenceName);

    expect(result).toEqual('referenceName');
  });

  it('returns a relative path when linking from a file', () => {
    const references = {
      referenceName: {
        referencePath: 'a/referencePath',
        displayName: 'displayName',
      },
      from: {
        referencePath: 'b/fromPath',
        displayName: 'fromName',
      },
    };
    const from = 'from';
    const referenceName = 'referenceName';

    const result = generateLink(references, from, referenceName);

    expect(result).toEqual({
      __type: 'link',
      title: 'displayName',
      url: '../a/referencePath',
    });
  });

  it('returns the name of the reference when the from reference is not found', () => {
    const references = {
      referenceName: {
        referencePath: 'a/referencePath',
        displayName: 'displayName',
      },
    };
    const from = 'from';
    const referenceName = 'referenceName';

    const result = generateLink(references, from, referenceName);

    expect(result).toEqual('referenceName');
  });
});
