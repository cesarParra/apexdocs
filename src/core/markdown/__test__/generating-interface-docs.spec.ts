import { extendExpect } from './expect-extensions';
import { unparsedApexBundleFromRawString, generateDocs } from './test-helpers';
import { assertEither } from '../../test-helpers/assert-either';

describe('Generates interface documentation', () => {
  beforeAll(() => {
    extendExpect();
  });

  describe('documentation content', () => {
    describe('method information', () => {
      it('displays the Method heading', async () => {
        const input = `
        public interface MyInterface {
          void myMethod();
        }
      `;

        const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('## Methods'));
      });

      it('displays methods sorted if sortAlphabetically is true', async () => {
        const input = `
        public interface MyInterface {
          void myMethod();
          void anotherMethod();
        }
      `;

        const result = await generateDocs([unparsedApexBundleFromRawString(input)], { sortAlphabetically: true })();
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => {
          expect(data.docs[0].content.indexOf('anotherMethod')).toBeLessThan(data.docs[0].content.indexOf('myMethod'));
        });
      });

      it('does not display methods sorted if sortAlphabetically is false', async () => {
        const input = `
        public interface MyInterface {
          void myMethod();
          void anotherMethod();
        }
      `;

        const result = await generateDocs([unparsedApexBundleFromRawString(input)], { sortAlphabetically: false })();
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => {
          expect(data.docs[0].content.indexOf('myMethod')).toBeLessThan(data.docs[0].content.indexOf('anotherMethod'));
        });
      });

      it('supports having mermaid diagrams in method descriptions', async () => {
        const input = `
        public interface MyInterface {
          /**
            * @mermaid
            * \`\`\`mermaid
            * graph TD
            *   A[Square Rect] -- Link text --> B((Circle))
            *   A --> C(Round Rect)
            *   B --> D{Rhombus}
            *   C --> D
            * \`\`\`
            */
          void myMethod();
        }
      `;

        const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('```mermaid'));
        assertEither(result, (data) => expect(data).firstDocContains('graph TD'));
      });

      it('supports having example code blocks in method descriptions', async () => {
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

        const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('```apex'));
        assertEither(result, (data) => expect(data).firstDocContains('public class MyClass'));
      });

      it('has a signature section', async () => {
        const input = `
        public interface MyInterface {
          void myMethod();
        }
      `;

        const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('### Signature'));
      });

      it('has a parameters section', async () => {
        const input = `
        public interface MyInterface {
          void myMethod(String param1, Integer param2);
        }
      `;

        const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('### Parameters'));
      });

      it('has a return type section', async () => {
        const input = `
        public interface MyInterface {
          String myMethod();
        }
      `;

        const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('### Return Type'));
      });

      it('has a throws section', async () => {
        const input = `
        public interface MyInterface {
          /**
            * @throws MyException
            */
          void myMethod();
        }
      `;

        const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('### Throws'));
      });

      it('displays an "inherited" tag if the method was inherited from a different interface', async () => {
        const input1 = `
        public interface MyInterface {
          void myMethod();
        }
      `;

        const input2 = `
        public interface AnotherInterface extends MyInterface {}
      `;

        const result = await generateDocs([
          unparsedApexBundleFromRawString(input1),
          unparsedApexBundleFromRawString(input2),
        ])();
        expect(result).documentationBundleHasLength(2);
        assertEither(result, (data) =>
          expect(data.docs.find((doc) => doc.outputDocPath.includes('AnotherInterface'))?.content).toContain(
            'Inherited',
          ),
        );
      });
    });
  });
});
