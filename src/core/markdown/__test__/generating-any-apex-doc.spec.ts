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
  });
});
