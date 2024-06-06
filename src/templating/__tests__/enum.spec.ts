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

  it('can reference the enum name with a description', () => {
    const template = '{{description}}';

    const enumSource = {
      name: 'MyEnum',
      description: 'An enum of things',
    };

    const result = compile(template, enumSource);

    expect(result).toBe('An enum of things');
  });
});

// TODO: description with links
