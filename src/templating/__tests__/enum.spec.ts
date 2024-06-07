import { compile } from '../compile';

describe('enum', () => {
  it('can reference the enum name', () => {
    const template = '{{name}} enum';

    const enumSource = {
      name: 'MyEnum',
      values: [],
    };

    const result = compile(template, enumSource);

    expect(result).toBe('MyEnum enum');
  });

  it('can reference the enum name with a description', () => {
    const template = '{{description}}';

    const enumSource = {
      name: 'MyEnum',
      values: [],
      description: ['An enum of things'],
    };

    const result = compile(template, enumSource);

    expect(result).toBe('An enum of things');
  });

  it('can reference a description with links', () => {
    const template = '{{description}}';

    const enumSource = {
      name: 'MyEnum',
      values: [],
      description: ['An enum of things: ', { title: 'More info', url: 'https://example.com' }],
    };

    const result = compile(template, enumSource);

    expect(result).toBe('An enum of things: [More info](https://example.com)');
  });

  it('can reference enum values', () => {
    const template = '{{#each values}}{{value}}{{/each}}';

    const enumSource = {
      name: 'MyEnum',
      values: [{ value: 'Value1' }, { value: 'Value2' }],
    };

    const result = compile(template, enumSource);

    expect(result).toBe('Value1Value2');
  });

  it('can reference enum values with a description', () => {
    const template = '{{#each values}}{{value}} - {{description}}{{/each}}';

    const enumSource = {
      name: 'MyEnum',
      values: [
        { value: 'Value1', description: ['The first value'] },
        { value: 'Value2', description: ['The second value'] },
      ],
    };

    const result = compile(template, enumSource);

    expect(result).toBe('Value1 - The first valueValue2 - The second value');
  });

  it('can reference see references', () => {
    const template = '{{#each sees}}**See** [{{title}}]({{url}}){{/each}}';

    const enumSource = {
      name: 'MyEnum',
      values: [],
      sees: [{ title: 'More info', url: 'https://example.com' }],
    };

    const result = compile(template, enumSource);

    expect(result).toBe('**See** [More info](https://example.com)');
  });
});
