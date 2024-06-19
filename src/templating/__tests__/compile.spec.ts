import { compile as testSubject } from '../compile';
import { ClassSource, EnumSource, InterfaceSource, Link, RenderableContent } from '../types';

jest.mock('../../settings', () => {
  return {
    Settings: {
      getInstance: jest.fn(() => ({
        getNamespace: jest.fn(() => 'MyNamespace'),
      })),
    },
  };
});

function renderableContentsToString(content?: RenderableContent[]) {
  if (!content) {
    return '';
  }

  function reduceDescription(acc: string, curr: RenderableContent) {
    if (typeof curr === 'string') {
      return acc + curr;
    } else if (Object.keys(curr).includes('title')) {
      return acc + (curr as Link).title;
    } else {
      return acc;
    }
  }

  return content.reduce(reduceDescription, '');
}

function linesToCodeBlock(_: string, lines: string[]): string {
  return lines.join('\n');
}

function compile(template: string, source: EnumSource | InterfaceSource | ClassSource) {
  return testSubject(template, source, {
    renderableContentConverter: renderableContentsToString,
    codeBlockConverter: linesToCodeBlock,
  });
}

describe('compile', () => {
  describe('helpers', () => {
    it('can split and capitalize text', () => {
      const template = '{{splitAndCapitalize name}}';

      const enumSource: EnumSource = {
        __type: 'enum',
        accessModifier: 'public',
        name: 'my-enum',
        values: [],
      };

      const result = compile(template, enumSource);

      expect(result).toBe('My Enum');
    });
  });

  describe('class', () => {
    it('can reference the class name', () => {
      const template = '{{name}} class';

      const classSource: ClassSource = {
        __type: 'class',
        name: 'MyClass',
        accessModifier: 'public',
      };

      const result = compile(template, classSource);

      expect(result).toBe('MyClass class');
    });

    it('can reference the class modifier', () => {
      const template = '{{classModifier}} class';

      const classSource: ClassSource = {
        __type: 'class',
        name: 'MyClass',
        accessModifier: 'public',
        classModifier: 'abstract',
      };

      const result = compile(template, classSource);

      expect(result).toBe('abstract class');
    });

    it('can reference the sharing modifier', () => {
      const template = '{{sharingModifier}} class';

      const classSource: ClassSource = {
        __type: 'class',
        name: 'MyClass',
        accessModifier: 'public',
        sharingModifier: 'with sharing',
      };

      const result = compile(template, classSource);

      expect(result).toBe('with sharing class');
    });

    it('can reference the implemented interfaces', () => {
      const template = '{{#each implements}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}';

      const classSource: ClassSource = {
        __type: 'class',
        name: 'MyClass',
        accessModifier: 'public',
        implements: [
          { title: 'MyInterface', url: 'https://example.com' },
          { title: 'MyOtherInterface', url: 'https://example.com' },
        ],
      };

      const result = compile(template, classSource);

      expect(result).toBe('MyInterface, MyOtherInterface');
    });

    it('can reference an extended class', () => {
      const template = '{{extends}}';

      const classSource: ClassSource = {
        __type: 'class',
        name: 'MyClass',
        accessModifier: 'public',
        extends: { title: 'MySuperClass', url: 'https://example.com' },
      };

      const result = compile(template, classSource);

      expect(result).toBe('MySuperClass');
    });

    describe('class fields', () => {
      it('can reference the field name', () => {
        const template = '{{#each fields}}{{name}}{{/each}}';

        const classSource: ClassSource = {
          __type: 'class',
          name: 'MyClass',
          accessModifier: 'public',
          fields: [{ name: 'myField', type: 'String', accessModifier: 'public' }],
        };

        const result = compile(template, classSource);

        expect(result).toBe('myField');
      });

      it('can reference the field type', () => {
        const template = '{{#each fields}}{{type}}{{/each}}';

        const classSource: ClassSource = {
          __type: 'class',
          name: 'MyClass',
          accessModifier: 'public',
          fields: [{ name: 'myField', type: 'String', accessModifier: 'public' }],
        };

        const result = compile(template, classSource);

        expect(result).toBe('String');
      });

      it('can reference the field access modifier', () => {
        const template = '{{#each fields}}{{accessModifier}}{{/each}}';

        const classSource: ClassSource = {
          __type: 'class',
          name: 'MyClass',
          accessModifier: 'public',
          fields: [{ name: 'myField', type: 'String', accessModifier: 'public' }],
        };

        const result = compile(template, classSource);

        expect(result).toBe('public');
      });

      it('can reference if it is inherited', () => {
        const template = '{{#each fields}}{{#if inherited}}Inherited{{/if}}{{/each}}';

        const classSource: ClassSource = {
          __type: 'class',
          name: 'MyClass',
          accessModifier: 'public',
          fields: [{ name: 'myField', type: 'String', accessModifier: 'public', inherited: true }],
        };

        const result = compile(template, classSource);

        expect(result).toBe('Inherited');
      });
    });
  });

  describe('interface', () => {
    it('can reference the interface name', () => {
      const template = '{{name}} interface';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('MyInterface interface');
    });

    it('can reference the access modifier', () => {
      const template = '{{accessModifier}} interface';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('public interface');
    });

    it('can reference the interface name with annotations', () => {
      const template = '{{name}} interface {{#each annotations}}{{this}} {{/each}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        annotations: ['MyAnnotation'],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('MyInterface interface MyAnnotation');
    });

    it('can reference the interface name with a description', () => {
      const template = '{{description}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        description: ['An interface of things'],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('An interface of things');
    });

    it('can reference a description with links', () => {
      const template = '{{description}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        description: ['An interface of things: ', { title: 'More info', url: 'https://example.com' }],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('An interface of things: More info');
    });

    it('can reference the extended interfaces of an interface', () => {
      const template = '{{#each extends}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        extends: [
          { title: 'MyInterface', url: 'https://example.com' },
          { title: 'MyOtherInterface', url: 'https://example.com' },
        ],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('MyInterface, MyOtherInterface');
    });

    it('can have a mermaid block at the top level description', () => {
      const template = '{{{mermaid}}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        mermaid: ['graph TD;', 'A-->B;', 'A-->C;'],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('graph TD;\nA-->B;\nA-->C;');
    });

    it('can have an example block at the top level description', () => {
      const template = '{{{example}}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        example: ['Example code block'],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('Example code block');
    });

    it('can display method titles', () => {
      const template = '{{#each methods}}{{title}}{{/each}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        methods: [{ title: 'myMethod()', signature: 'void myMethod()' }],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('myMethod()');
    });

    it('can display method signatures', () => {
      const template = '{{#each methods}}{{signature}}{{/each}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        methods: [{ title: 'myMethod()', signature: 'void myMethod()' }],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('void myMethod()');
    });

    it('can display methods with a description', () => {
      const template = '{{#each methods}}{{signature}} - {{description}}{{/each}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        methods: [{ title: 'myMethod()', signature: 'void myMethod()', description: ['The method'] }],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('void myMethod() - The method');
    });

    it('can display annotations of a method', () => {
      const template = '{{#each methods}}{{#each annotations}}{{this}}{{/each}}{{/each}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        methods: [{ title: 'myMethod()', signature: 'void myMethod()', annotations: ['MyAnnotation'] }],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('MyAnnotation');
    });

    it('can display the parameters of a method', () => {
      const template = '{{#each methods}}{{#each parameters}}{{name}} - {{description}}{{/each}}{{/each}}';

      const parameters = [
        { name: 'arg1', type: 'String', description: ['The first argument'] },
        { name: 'arg2', type: 'Integer' },
      ];
      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        methods: [{ title: 'myMethod()', signature: 'void myMethod(String arg1, Integer arg2)', parameters }],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('arg1 - The first argumentarg2 -');
    });

    it('can display the return value of a method', () => {
      const template = '{{#each methods}}{{returnType.type}}{{/each}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        methods: [
          {
            title: 'myMethod()',
            signature: 'String myMethod()',
            returnType: {
              type: 'String',
              description: ['The return value'],
            },
          },
        ],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('String');
    });

    it('can display the exceptions that a method throws', () => {
      const template = '{{#each methods}}{{#each throws}}{{type}}{{/each}}{{/each}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        methods: [
          {
            title: 'myMethod()',
            signature: 'void myMethod()',
            throws: [{ type: 'IOException', description: ['An exception'] }],
          },
        ],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('IOException');
    });

    it('can display custom tags in a method', () => {
      const template = '{{#each methods}}{{#each customTags}}{{name}} - {{value}}{{/each}}{{/each}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        methods: [
          {
            title: 'myMethod()',
            signature: 'void myMethod()',
            customTags: [{ name: 'CustomTag', value: ['My custom tag'] }],
          },
        ],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('CustomTag - My custom tag');
    });

    it('can display mermaid blocks in a method', () => {
      const template = '{{#each methods}}{{{mermaid}}}{{/each}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        methods: [
          {
            title: 'myMethod()',
            signature: 'void myMethod()',
            mermaid: ['graph TD;', 'A-->B;', 'A-->C;'],
          },
        ],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('graph TD;\nA-->B;\nA-->C;');
    });

    it('can display example blocks in a method', () => {
      const template = '{{#each methods}}{{{example}}}{{/each}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        methods: [
          {
            title: 'myMethod()',
            signature: 'void myMethod()',
            example: ['Example code block'],
          },
        ],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('Example code block');
    });

    it('can display if a method was inherited from a super interface', () => {
      const template = '{{#each methods}}{{#if inherited}}Inherited{{/if}}{{/each}}';

      const interfaceSource: InterfaceSource = {
        __type: 'interface',
        name: 'MyInterface',
        accessModifier: 'public',
        methods: [
          {
            title: 'myMethod()',
            signature: 'void myMethod()',
            inherited: true,
          },
        ],
      };

      const result = compile(template, interfaceSource);

      expect(result).toBe('Inherited');
    });
  });

  describe('enum', () => {
    it('can reference the enum name', () => {
      const template = '{{name}} enum';

      const enumSource: EnumSource = {
        __type: 'enum',
        accessModifier: 'public',
        name: 'MyEnum',
        values: [],
      };

      const result = compile(template, enumSource);

      expect(result).toBe('MyEnum enum');
    });

    it('can reference the access modifier', () => {
      const template = '{{accessModifier}} enum';

      const enumSource: EnumSource = {
        __type: 'enum',
        accessModifier: 'public',
        name: 'MyEnum',
        values: [],
      };

      const result = compile(template, enumSource);

      expect(result).toBe('public enum');
    });

    it('can reference the enum name with a description', () => {
      const template = '{{description}}';

      const enumSource: EnumSource = {
        __type: 'enum',
        accessModifier: 'public',
        name: 'MyEnum',
        values: [],
        description: ['An enum of things'],
      };

      const result = compile(template, enumSource);

      expect(result).toBe('An enum of things');
    });

    it('can reference a description with links', () => {
      const template = '{{description}}';

      const enumSource: EnumSource = {
        __type: 'enum',
        accessModifier: 'public',
        name: 'MyEnum',
        values: [],
        description: ['An enum of things: ', { title: 'More info', url: 'https://example.com' }],
      };

      const result = compile(template, enumSource);

      expect(result).toBe('An enum of things: More info');
    });

    it('can have a mermaid block at the top level description', () => {
      const template = '{{{mermaid}}}';

      const enumSource: EnumSource = {
        __type: 'enum',
        name: 'MyEnum',
        accessModifier: 'public',
        mermaid: ['graph TD;', 'A-->B;', 'A-->C;'],
        values: [],
      };

      const result = compile(template, enumSource);

      expect(result).toBe('graph TD;\nA-->B;\nA-->C;');
    });

    it('can have an example block at the top level description', () => {
      const template = '{{{example}}}';

      const enumSource: EnumSource = {
        __type: 'enum',
        name: 'MyEnum',
        accessModifier: 'public',
        example: ['Example code block'],
        values: [],
      };

      const result = compile(template, enumSource);

      expect(result).toBe('Example code block');
    });

    it('can reference enum values', () => {
      const template = '{{#each values}}{{value}}{{/each}}';

      const enumSource: EnumSource = {
        __type: 'enum',
        accessModifier: 'public',
        name: 'MyEnum',
        values: [{ value: 'Value1' }, { value: 'Value2' }],
      };

      const result = compile(template, enumSource);

      expect(result).toBe('Value1Value2');
    });

    it('can reference enum values with a description', () => {
      const template = '{{#each values}}{{value}} - {{description}}{{/each}}';

      const enumSource: EnumSource = {
        __type: 'enum',
        accessModifier: 'public',
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

      const enumSource: EnumSource = {
        __type: 'enum',
        accessModifier: 'public',
        name: 'MyEnum',
        values: [],
        group: 'MyGroup',
      };

      const result = compile(template, enumSource);

      expect(result).toBe('** Group MyGroup');
    });

    it('can reference an author reference', () => {
      const template = '** Author {{author}}';

      const enumSource: EnumSource = {
        __type: 'enum',
        accessModifier: 'public',
        name: 'MyEnum',
        values: [],
        author: 'Test Testerson',
      };

      const result = compile(template, enumSource);

      expect(result).toBe('** Author Test Testerson');
    });

    it('can reference a date reference', () => {
      const template = '** Date {{date}}';

      const enumSource: EnumSource = {
        __type: 'enum',
        accessModifier: 'public',
        name: 'MyEnum',
        values: [],
        date: '2021-01-01',
      };

      const result = compile(template, enumSource);

      expect(result).toBe('** Date 2021-01-01');
    });

    it('can reference custom tags', () => {
      const template = '{{#each customTags}}**{{name}}** {{value}}{{/each}}';

      const enumSource: EnumSource = {
        __type: 'enum',
        accessModifier: 'public',
        name: 'MyEnum',
        values: [],
        customTags: [{ name: 'CustomTag', value: ['My custom tag'] }],
      };

      const result = compile(template, enumSource);

      expect(result).toBe('**CustomTag** My custom tag');
    });

    it('can reference see references', () => {
      const template = '{{#each sees}}**See** [{{title}}]({{url}}){{/each}}';

      const enumSource: EnumSource = {
        __type: 'enum',
        accessModifier: 'public',
        name: 'MyEnum',
        values: [],
        sees: [{ title: 'More info', url: 'https://example.com' }],
      };

      const result = compile(template, enumSource);

      expect(result).toBe('**See** [More info](https://example.com)');
    });
  });
});
