import { assertEither, extendExpect } from './expect-extensions';
import { generateDocs } from '../../core/markdown/generate-docs';
import { apexBundleFromRawString } from './test-helpers';

describe('Generates interface documentation', () => {
  beforeAll(() => {
    extendExpect();
  });

  describe('documentation output', () => {
    it('always returns markdown as the format', () => {
      const input = `
      public interface MyInterface {
      }
     `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      assertEither(result, (data) => expect(data.format).toBe('markdown'));
    });

    it('returns the name of the interface', () => {
      const input = `
      public interface MyInterface {
      }
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].typeName).toBe('MyInterface'));
    });

    it('returns the type as interface', () => {
      const input = `
      public interface MyInterface {
      }
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].type).toBe('interface'));
    });

    it('does not return interfaces out of scope', () => {
      const input1 = `
        global interface MyInterface {}
      `;

      const input2 = `
        public interface AnotherInterface {}
      `;

      const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)], {
        scope: ['global'],
      });
      expect(result).documentationBundleHasLength(1);
    });

    it('does not return interfaces that have an @ignore in the docs', () => {
      const input = `
      /**
        * @ignore
        */
      public interface MyInterface {}`;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(0);
    });

    it('does not return interface methods that have @ignore in the docs', () => {
      const input = `
      public interface MyInterface {
        /**
          * @ignore
          */
        void myMethod();
      }`;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].docContents).not.toContain('myMethod'));
    });
  });

  describe('documentation content', () => {
    describe('type level information', () => {
      it('generates a heading with the interface name', () => {
        const input = `
        public interface MyInterface {}
      `;

        const output = `# MyInterface Interface`;
        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains(output));
      });

      it('displays type level annotations', () => {
        const input = `
        @NamespaceAccessible
        public interface MyInterface {
          @Deprecated
          void myMethod();   
        }
       `;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('NAMESPACEACCESSIBLE'));
        assertEither(result, (data) => expect(data).firstDocContains('DEPRECATED'));
      });

      it('displays the description', () => {
        const input = `
          /**
           * This is a description
           */
          public interface MyInterface {}
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
          public interface MyInterface {}
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
          public interface MyInterface {}`;

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
          public interface MyInterface {}`;

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
          public interface MyInterface {}`;

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
          public interface MyInterface {}`;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('This is a description'));
      });

      it('displays descriptions with links', () => {
        const input1 = `
          /**
            * @description This is a description with a {@link InterfaceRef} reference
            */
          public enum MyInterface {}
          `;

        const input2 = 'public interface InterfaceRef {}';

        const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)]);
        expect(result).documentationBundleHasLength(2);
        assertEither(result, (data) =>
          expect(data).firstDocContains('This is a description with a [InterfaceRef](./InterfaceRef.md) reference'),
        );
      });

      it('displays descriptions with emails', () => {
        const input = `
          /**
            * @description This is a description with an {@email test@testerson.com} email
            */
          public interface MyInterface {}
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
            * @see InterfaceRef
            */
          public interface MyInterface {}
          `;

        const input2 = 'public interface InterfaceRef {}';

        const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)]);
        expect(result).documentationBundleHasLength(2);
        assertEither(result, (data) => expect(data).firstDocContains('See'));
        assertEither(result, (data) => expect(data).firstDocContains('[InterfaceRef](./InterfaceRef.md)'));
      });

      it('displays sees without links when the reference is not found', () => {
        const input = `
          /**
            * @see InterfaceRef
            */
          public interface MyInterface {}
          `;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('See'));
        assertEither(result, (data) => expect(data).firstDocContains('InterfaceRef'));
      });

      it('displays the namespace if present in the config', () => {
        const input = 'public interface MyInterface {}';

        const result = generateDocs([apexBundleFromRawString(input)], { namespace: 'MyNamespace' });
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('## Namespace'));
        assertEither(result, (data) => expect(data).firstDocContains('MyNamespace'));
      });

      it('does not display the namespace if not present in the config', () => {
        const input = 'public interface MyInterface {}';

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
          public interface MyInterface {}
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
          public interface MyInterface {}`;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('```apex'));
        assertEither(result, (data) => expect(data).firstDocContains('public class MyClass'));
      });
    });

    describe('method information', () => {
      it('displays the Method heading', () => {
        const input = `
        public interface MyInterface {
          void myMethod();
        }
      `;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('## Methods'));
      });

      it('supports having mermaid diagrams in method descriptions', () => {
        const input = `
        public interface MyInterface {
          /**
            * @mermaid
            * graph TD
            *   A[Square Rect] -- Link text --> B((Circle))
            *   A --> C(Round Rect)
            *   B --> D{Rhombus}
            *   C --> D
            */
          void myMethod();
        }
      `;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('```mermaid'));
        assertEither(result, (data) => expect(data).firstDocContains('graph TD'));
      });

      it('supports having example code blocks in method descriptions', () => {
        const input = `
        public interface MyInterface {
          /**
            * @example
            * public class MyClass {
            *   public void myMethod() {
            *     System.debug('Hello, World!');
            *   }
            * }
            */
          void myMethod();
        }
      `;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('```apex'));
        assertEither(result, (data) => expect(data).firstDocContains('public class MyClass'));
      });

      it('has a signature section', () => {
        const input = `
        public interface MyInterface {
          void myMethod();
        }
      `;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('### Signature'));
      });

      it('has a parameters section', () => {
        const input = `
        public interface MyInterface {
          void myMethod(String param1, Integer param2);
        }
      `;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('### Parameters'));
      });

      it('has a return type section', () => {
        const input = `
        public interface MyInterface {
          String myMethod();
        }
      `;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('### Return Type'));
      });

      it('has a throws section', () => {
        const input = `
        public interface MyInterface {
          /**
            * @throws MyException
            */
          void myMethod();
        }
      `;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('### Throws'));
      });

      it('displays an "inherited" tag if the method was inherited from a different interface', () => {
        const input1 = `
        public interface MyInterface {
          void myMethod();
        }
      `;

        const input2 = `
        public interface AnotherInterface extends MyInterface {}
      `;

        const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)]);
        expect(result).documentationBundleHasLength(2);
        assertEither(result, (data) =>
          expect(data.docs.find((doc) => doc.typeName === 'AnotherInterface')?.docContents).toContain('Inherited'),
        );
      });
    });
  });
});
