import { extendExpect } from './expect-extensions';
import { unparsedApexBundleFromRawString, generateDocs } from './test-helpers';
import { assertEither } from '../../test-helpers/assert-either';

describe('When generating documentation', () => {
  beforeAll(() => {
    extendExpect();
  });

  describe('the documentation content', () => {
    it('displays type level annotations', async () => {
      const input = `
        @NamespaceAccessible
        public class MyClass {
          @Deprecated
          public void myMethod() {}
        }
       `;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();

      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('NAMESPACEACCESSIBLE'));
      assertEither(result, (data) => expect(data).firstDocContains('DEPRECATED'));
    });

    it('displays metadata as annotations', async () => {
      const input = 'public class MyClass {}';
      const metadata = `
        <?xml version="1.0" encoding="UTF-8"?>
        <ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
            <apiVersion>59.0</apiVersion>
            <status>Active</status>
        </ApexClass>
        `;

      const result = await generateDocs([unparsedApexBundleFromRawString(input, metadata)])();

      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('APIVERSION'));
      assertEither(result, (data) => expect(data).firstDocContains('STATUS'));
    });

    it('displays the description when no @description tag is used', async () => {
      const input = `
          /**
           * This is a description
           */
          public class MyClass {}
         `;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();

      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('This is a description'));
    });

    it('displays the description when a @description tag is used', async () => {
      const input = `
          /**
            * @description This is a description
            */
          public class MyClass {}`;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('This is a description'));
    });

    it('display custom documentation tags', async () => {
      const input = `
          /**
           * @custom-tag My Value
           */
          public class MyClass {}
        `;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('Custom Tag'));
      assertEither(result, (data) => expect(data).firstDocContains('My Value'));
    });

    it('displays the group', async () => {
      const input = `
          /**
           * @group MyGroup
           */
          public class MyClass {}`;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('Group'));
      assertEither(result, (data) => expect(data).firstDocContains('MyGroup'));
    });

    it('displays the author', async () => {
      const input = `
          /**
           * @author John Doe
           */
          public class MyClass {}`;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('Author'));
      assertEither(result, (data) => expect(data).firstDocContains('John Doe'));
    });

    it('displays the date', async () => {
      const input = `
          /**
           * @date 2021-01-01
           */
          public class MyClass {}`;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('Date'));
      assertEither(result, (data) => expect(data).firstDocContains('2021-01-01'));
    });

    it('displays descriptions with links', async () => {
      const input1 = `
          /**
            * @description This is a description with a {@link ClassRef} reference
            */
          public enum MyClass {}
          `;

      const input2 = 'public class ClassRef {}';

      const result = await generateDocs([
        unparsedApexBundleFromRawString(input1),
        unparsedApexBundleFromRawString(input2),
      ])();
      expect(result).documentationBundleHasLength(2);
      assertEither(result, (data) =>
        expect(data).firstDocContains('This is a description with a [ClassRef](ClassRef.md) reference'),
      );
    });

    it('displays descriptions with emails', async () => {
      const input = `
          /**
            * @description This is a description with an {@email test@testerson.com} email
            */
          public class MyClass {}
          `;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) =>
        expect(data).firstDocContains(
          'This is a description with an [test@testerson.com](mailto:test@testerson.com) email',
        ),
      );
    });

    it('displays @sees with accurately resolved links', async () => {
      const input1 = `
          /**
            * @see ClassRef
            */
          public class MyClass {}
          `;

      const input2 = 'public class ClassRef {}';

      const result = await generateDocs([
        unparsedApexBundleFromRawString(input1),
        unparsedApexBundleFromRawString(input2),
      ])();
      expect(result).documentationBundleHasLength(2);
      assertEither(result, (data) => expect(data).firstDocContains('See'));
      assertEither(result, (data) => expect(data).firstDocContains('[ClassRef](ClassRef.md)'));
    });

    it('displays @sees without links when the reference is not found', async () => {
      const input = `
        /**
          * @see ClassRef
          */
        public class MyClass {}
        `;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();

      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('See'));
      assertEither(result, (data) => expect(data).firstDocContains('ClassRef'));
    });

    it('displays the namespace if present in the config', async () => {
      const input = 'public class MyClass {}';

      const result = await generateDocs([unparsedApexBundleFromRawString(input)], { namespace: 'MyNamespace' })();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Namespace'));
      assertEither(result, (data) => expect(data).firstDocContains('MyNamespace'));
    });

    it('does not display the namespace if not present in the config', async () => {
      const input = 'public class MyClass {}';

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContainsNot('## Namespace'));
    });

    it('displays a mermaid diagram', async () => {
      const input = `
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
          public class MyClass {}
          `;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('```mermaid'));
      assertEither(result, (data) => expect(data).firstDocContains('graph TD'));
    });

    it('displays an example code block', async () => {
      const input = `
          /**
            * @example
            * \`\`\`apex
            * public class MyClass {
            *   public void myMethod() {
            *     System.debug('Hello, World!');
            *   }
            * }
            * \`\`\`
            */
          public class MyClass {}`;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();

      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('```apex'));
      assertEither(result, (data) => expect(data).firstDocContains('public class MyClass'));
    });

    it('does not display tags marked as excluded', async () => {
      const input = `
        /**
          * @see ClassRef
          */
        public class MyClass {}
        `;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)], {
        excludeTags: ['see'],
      })();

      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContainsNot('See'));
    });

    it('displays {@code} tags in descriptions as inline code', async () => {
      const input = `
          /**
            * @description Returns {@code null} when the record is missing
            */
          public class MyClass {}`;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('`null`'));
      assertEither(result, (data) => expect(data).firstDocContainsNot('{@code'));
    });

    it('displays {@literal} tags in descriptions as their plain text content', async () => {
      const input = `
          /**
            * @description Use a value {@literal <not a tag>} here
            */
          public class MyClass {}`;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContainsNot('{@literal'));
      assertEither(result, (data) => expect(data).firstDocContains('not a tag'));
    });

    it('displays quoted @sees as plain text without the quotes', async () => {
      const input = `
        /**
          * @see "The Salesforce Security Guide"
          */
        public class MyClass {}
        `;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();

      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('The Salesforce Security Guide'));
      assertEither(result, (data) => expect(data).firstDocContainsNot('"The Salesforce Security Guide"'));
    });

    it('displays @sees with an HTML anchor as a link to the URL', async () => {
      const input = `
        /**
          * @see <a href="https://example.com">Example Site</a>
          */
        public class MyClass {}
        `;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();

      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('[Example Site](https://example.com)'));
    });

    it('displays @sees that reference a member as a link to the member section', async () => {
      const input1 = `
          /**
            * @see ClassRef#myMethod()
            */
          public class MyClass {}
          `;

      const input2 = `
        public class ClassRef {
          public void myMethod() {}
        }`;

      const result = await generateDocs([
        unparsedApexBundleFromRawString(input1),
        unparsedApexBundleFromRawString(input2),
      ])();
      expect(result).documentationBundleHasLength(2);
      assertEither(result, (data) => expect(data).firstDocContains('[ClassRef.myMethod()](ClassRef.md#mymethod)'));
    });

    it('displays {@link} references to members as links to the member section', async () => {
      const input1 = `
          /**
            * @description Delegates to {@link ClassRef#myMethod()} internally
            */
          public class MyClass {}
          `;

      const input2 = `
        public class ClassRef {
          public void myMethod() {}
        }`;

      const result = await generateDocs([
        unparsedApexBundleFromRawString(input1),
        unparsedApexBundleFromRawString(input2),
      ])();
      expect(result).documentationBundleHasLength(2);
      assertEither(result, (data) => expect(data).firstDocContains('[ClassRef.myMethod()](ClassRef.md#mymethod)'));
    });

    it('displays a deprecation notice when the @deprecated tag is used', async () => {
      const input = `
          /**
            * @deprecated Use NewClass instead
            */
          public class MyClass {}`;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('> **Deprecated**'));
      assertEither(result, (data) => expect(data).firstDocContains('Use NewClass instead'));
    });

    it('displays a deprecation notice when the @deprecated tag has no body', async () => {
      const input = `
          /**
            * @deprecated
            */
          public class MyClass {}`;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('> **Deprecated**'));
    });

    it('displays all authors when multiple @author tags are used', async () => {
      const input = `
          /**
           * @author John Doe
           * @author Jane Doe
           */
          public class MyClass {}`;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('**Author** John Doe'));
      assertEither(result, (data) => expect(data).firstDocContains('**Author** Jane Doe'));
    });

    it('does not generate documentation for types whose doc comment contains {@hidden}', async () => {
      const input = `
        /**
          * {@hidden}
          */
        public class MyClass {}
        `;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();

      expect(result).documentationBundleHasLength(0);
    });
  });
});
