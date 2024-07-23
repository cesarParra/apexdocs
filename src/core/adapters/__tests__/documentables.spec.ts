import { adaptDescribable } from '../documentables';

function linkGenerator(typeName: string) {
  return typeName;
}

describe('describable', () => {
  it('returns undefined if describable is undefined', () => {
    const result = adaptDescribable(undefined, linkGenerator);

    expect(result).toEqual({
      description: undefined,
    });
  });

  it('returns an empty array if describable is an empty array', () => {
    const result = adaptDescribable([], linkGenerator);

    expect(result).toEqual({
      description: [],
    });
  });

  it('returns a string if describable contains a string', () => {
    const describable = ['This is a test'];

    const result = adaptDescribable(describable, linkGenerator);

    expect(result).toEqual({
      description: ['This is a test'],
    });
  });

  it('separates strings with an empty line', () => {
    const describable = ['This is a test', 'This is another test'];

    const result = adaptDescribable(describable, linkGenerator);

    expect(result).toEqual({
      description: ['This is a test', { __type: 'empty-line' }, 'This is another test'],
    });
  });

  it('returns a code block if describable contains code', () => {
    const describable = ['```typescript', 'const a = 1;', '```'];

    const result = adaptDescribable(describable, linkGenerator);

    expect(result).toEqual({
      description: [
        {
          __type: 'code-block',
          language: 'typescript',
          content: ['const a = 1;'],
        },
      ],
    });
  });

  it('returns a code block followed by an empty line and then whatever content is in the describable', () => {
    const describable = ['```typescript', 'const a = 1;', '```', 'This is a test'];

    const result = adaptDescribable(describable, linkGenerator);

    expect(result).toEqual({
      description: [
        {
          __type: 'code-block',
          language: 'typescript',
          content: ['const a = 1;'],
        },
        { __type: 'empty-line' },
        'This is a test',
      ],
    });
  });
});
