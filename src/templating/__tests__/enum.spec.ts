import { compile as testSubject } from '../compile';
import { EnumSource, RenderableContent } from '../types';

function renderableContentsToString(content?: RenderableContent[]) {
  if (!content) {
    return '';
  }

  function reduceDescription(acc: string, curr: RenderableContent) {
    if (typeof curr === 'string') {
      return acc + curr;
    } else {
      return acc + curr.title;
    }
  }

  return content.reduce(reduceDescription, '');
}

function compile(template: string, source: EnumSource) {
  return testSubject(template, source, {
    renderableContentConverter: renderableContentsToString,
  });
}

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

    expect(result).toBe('An enum of things: More info');
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

  it('can reference a group reference', () => {
    const template = '** Group {{group}}';

    const enumSource = {
      name: 'MyEnum',
      values: [],
      group: 'MyGroup',
    };

    const result = compile(template, enumSource);

    expect(result).toBe('** Group MyGroup');
  });

  it('can reference an author reference', () => {
    const template = '** Author {{author}}';

    const enumSource = {
      name: 'MyEnum',
      values: [],
      author: 'Test Testerson',
    };

    const result = compile(template, enumSource);

    expect(result).toBe('** Author Test Testerson');
  });

  it('can reference a date reference', () => {
    const template = '** Date {{date}}';

    const enumSource = {
      name: 'MyEnum',
      values: [],
      date: '2021-01-01',
    };

    const result = compile(template, enumSource);

    expect(result).toBe('** Date 2021-01-01');
  });

  it('can reference custom tags', () => {
    const template = '{{#each customTags}}**{{name}}** {{value}}{{/each}}';

    const enumSource = {
      name: 'MyEnum',
      values: [],
      customTags: [{ name: 'CustomTag', value: 'My custom tag' }],
    };

    const result = compile(template, enumSource);

    expect(result).toBe('**CustomTag** My custom tag');
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
