import { compile } from '../compile';

describe('enum', () => {
  it('can reference the enum name', () => {
    const template = '{{name}} enum';

    const enumSource = {
      name: 'MyEnum',
    };

    const result = compile(template, enumSource);

    expect(result).toBe('MyEnum enum');
  });
});

// description
// description with links
