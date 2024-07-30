import { assertEither, extendExpect } from './expect-extensions';
import { apexBundleFromRawString } from './test-helpers';
import { generateDocs } from '../../core/markdown/generate-docs';

describe('Generates enum documentation', () => {
  beforeAll(() => {
    extendExpect();
  });

  describe('documentation output', () => {
    it('always returns markdown as the format', () => {
      const input = `
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      assertEither(result, (data) => expect(data.format).toBe('markdown'));
    });

    it('returns the name of the enum', () => {
      const input = `
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].typeName).toBe('MyEnum'));
    });

    it('returns the type as enum', () => {
      const input = `
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].type).toBe('enum'));
    });

    it('does not return enums out of scope', () => {
      const input1 = `
     global enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const input2 = `
      public enum MyEnum {
          VALUE1,
          VALUE2
        }
      `;

      const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)], {
        scope: ['global'],
      });
      expect(result).documentationBundleHasLength(1);
    });

    it('does not return enums that have an @ignore in the docs', () => {
      const input = `
      /**
        * @ignore
        */
      public enum MyEnum {
        VALUE1,
        VALUE2
      }
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(0);
    });
  });

  describe('documentation content', () => {
    it('generates a heading with the enum name', () => {
      const input = `
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const output = `# MyEnum Enum`;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains(output));
    });

    it('displays type level annotations', () => {
      const input = `
        @NamespaceAccessible
        public enum MyEnum {
           VALUE1,
           VALUE2
         }
       `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('NAMESPACEACCESSIBLE'));
    });

    it('displays the description', () => {
      const input = `
     /**
      * This is a description
      */
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('This is a description'));
    });

    it('display custom documentation tags', () => {
      const input = `
     /**
      * @custom-tag My Value
      */
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('Custom Tag'));
      assertEither(result, (data) => expect(data).firstDocContains('My Value'));
    });

    it('displays the group', () => {
      const input = `
     /**
      * @group MyGroup
      */
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('Group'));
      assertEither(result, (data) => expect(data).firstDocContains('MyGroup'));
    });

    it('displays the author', () => {
      const input = `
     /**
      * @author John Doe
      */
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('Author'));
      assertEither(result, (data) => expect(data).firstDocContains('John Doe'));
    });

    it('displays the date', () => {
      const input = `
     /**
      * @date 2021-01-01
      */
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('Date'));
      assertEither(result, (data) => expect(data).firstDocContains('2021-01-01'));
    });

    it('displays descriptions', () => {
      const input = `
      /**
        * @description This is a description
        */
      public enum MyEnum {}
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('This is a description'));
    });

    it('displays descriptions with links', () => {
      const input1 = `
      /**
        * @description This is a description with a {@link EnumRef} reference
        */
      public enum MyEnum {}
      `;

      const input2 = 'public enum EnumRef {}';

      const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)]);
      expect(result).documentationBundleHasLength(2);
      assertEither(result, (data) => expect(data).firstDocContains('Description'));
      assertEither(result, (data) =>
        expect(data).firstDocContains('This is a description with a [EnumRef](./EnumRef.md) reference'),
      );
    });

    it('displays descriptions with emails', () => {
      const input = `
      /**
        * @description This is a description with an {@email test@testerson.com} email
        */
      public enum MyEnum {}
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) =>
        expect(data).firstDocContains(
          'This is a description with an [test@testerson.com](mailto:test@testerson.com) email',
        ),
      );
    });

    it('displays sees with accurately resolved links', () => {
      const input1 = `
      /**
        * @see EnumRef
        */
      public enum MyEnum {}
      `;

      const input2 = 'public enum EnumRef {}';

      const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)]);
      expect(result).documentationBundleHasLength(2);
      assertEither(result, (data) => expect(data).firstDocContains('See'));
      assertEither(result, (data) => expect(data).firstDocContains('[EnumRef](./EnumRef.md)'));
    });

    it('displays sees without links when the reference is not found', () => {
      const input = `
      /**
        * @see EnumRef
        */
      public enum MyEnum {}
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('See'));
      assertEither(result, (data) => expect(data).firstDocContains('EnumRef'));
    });

    it('displays the namespace if present in the config', () => {
      const input = `
      public enum MyEnum {}
      `;

      const result = generateDocs([apexBundleFromRawString(input)], { namespace: 'MyNamespace' });
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Namespace'));
      assertEither(result, (data) => expect(data).firstDocContains('MyNamespace'));
    });

    it('does not display the namespace if not present in the config', () => {
      const input = `
      public enum MyEnum {}
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContainsNot('## Namespace'));
    });

    it('displays a mermaid diagram', () => {
      const input = `
      /**
        * @mermaid
        * graph TD
        *   A[Square Rect] -- Link text --> B((Circle))
        *   A --> C(Round Rect)
        *   B --> D{Rhombus}
        *   C --> D
        */
      public enum MyEnum {
        VALUE1,
        VALUE2
      }
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('```mermaid'));
      assertEither(result, (data) => expect(data).firstDocContains('graph TD'));
    });

    it('displays an example code block', () => {
      const input = `
      /**
        * @example
        * public class MyClass {
        *   public void myMethod() {
        *     System.debug('Hello, World!');
        *   }
        * }
        */
      public enum MyEnum {
        VALUE1,
        VALUE2
      }
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('```apex'));
      assertEither(result, (data) => expect(data).firstDocContains('public class MyClass'));
    });

    it('displays values', () => {
      const input = `
      public enum MyEnum {
        VALUE1,
        VALUE2
      }
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Values'));
      assertEither(result, (data) => expect(data).firstDocContains('VALUE1'));
      assertEither(result, (data) => expect(data).firstDocContains('VALUE2'));
    });
  });
});
