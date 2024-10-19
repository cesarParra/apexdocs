import { DocPageData, PostHookDocumentationBundle } from '../../shared/types';
import { extendExpect } from './expect-extensions';
import { unparsedApexBundleFromRawString, generateDocs, unparsedObjectBundleFromRawString } from './test-helpers';
import { assertEither } from '../../test-helpers/assert-either';

function customObjectGenerator(
  config: { deploymentStatus: string; visibility: string } = { deploymentStatus: 'Deployed', visibility: 'Public' },
) {
  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
        <deploymentStatus>${config.deploymentStatus}</deploymentStatus>
        <description>test object for testing</description>
        <label>MyFirstObject</label>
        <pluralLabel>MyFirstObjects</pluralLabel>
        <visibility>${config.visibility}</visibility>
    </CustomObject>`;
}

function aSingleDoc(result: PostHookDocumentationBundle): DocPageData {
  expect(result.docs).toHaveLength(1);
  return result.docs[0];
}

describe('When generating documentation', () => {
  beforeAll(() => {
    extendExpect();
  });

  describe('the resulting files', () => {
    it('Apex code is named after the type', async () => {
      const properties: [string, string][] = [
        ['public class MyClass {}', 'MyClass.md'],
        ['public interface MyInterface {}', 'MyInterface.md'],
        ['public enum MyEnum {}', 'MyEnum.md'],
      ];

      for (const [input, expected] of properties) {
        const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
        assertEither(result, (data) => expect(aSingleDoc(data).outputDocPath).toContain(expected));
      }
    });

    it('SObject code is named after the path', async () => {
      const properties: [
        {
          rawContent: string;
          filePath: string;
        },
        string,
      ][] = [
        [
          {
            rawContent: customObjectGenerator(),
            filePath: 'src/object/MyFirstObject__c.object-meta.xml',
          },
          'MyFirstObject__c.md',
        ],
        [
          {
            rawContent: customObjectGenerator(),
            filePath: 'src/object/MySecondObject__c.object-meta.xml',
          },
          'MySecondObject__c.md',
        ],
      ];

      for (const [input, expected] of properties) {
        const result = await generateDocs([unparsedObjectBundleFromRawString(input)])();
        assertEither(result, (data) => expect(aSingleDoc(data).outputDocPath).toContain(expected));
      }
    });

    it('Apex code is placed in the miscellaneous folder if no group is provided', async () => {
      const properties: [string, string][] = [
        ['public class MyClass {}', 'miscellaneous'],
        ['public interface MyInterface {}', 'miscellaneous'],
        ['public enum MyEnum {}', 'miscellaneous'],
      ];

      for (const [input, expected] of properties) {
        const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
        assertEither(result, (data) => expect(aSingleDoc(data).outputDocPath).toContain(expected));
      }
    });

    it('SObject code is placed in the custom objects folder', async () => {
      const properties: [
        {
          rawContent: string;
          filePath: string;
        },
        string,
      ][] = [
        [
          {
            rawContent: customObjectGenerator(),
            filePath: 'src/object/MyFirstObject__c.object-meta.xml',
          },
          'custom-objects',
        ],
        [
          {
            rawContent: customObjectGenerator(),
            filePath: 'src/object/MySecondObject__c.object-meta.xml',
          },
          'custom-objects',
        ],
      ];

      for (const [input, expected] of properties) {
        const result = await generateDocs([unparsedObjectBundleFromRawString(input)])();
        assertEither(result, (data) => expect(aSingleDoc(data).outputDocPath).toContain(expected));
      }
    });

    it('Apex code is placed in the slugified group folder if a group is provided', async () => {
      const properties: [string, string][] = [
        [
          `/**
           * @group MyGroup
           */
           public class MyClass {}`,
          'mygroup',
        ],
        [
          `/**
           * @group MyGroup
           */
           public interface MyInterface {}`,
          'mygroup',
        ],
        [
          `/**
           * @group MyGroup
           */
           public enum MyEnum {}`,
          'mygroup',
        ],
      ];

      for (const [input, expected] of properties) {
        const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
        assertEither(result, (data) => expect(aSingleDoc(data).outputDocPath).toContain(expected));
      }
    });
  });

  describe('the generated bundles', () => {
    it('Apex code returns the type', async () => {
      const properties: [string, string][] = [
        ['public class MyClass {}', 'class'],
        ['public interface MyInterface {}', 'interface'],
        ['public enum MyEnum {}', 'enum'],
      ];

      for (const [input, expected] of properties) {
        const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
        assertEither(result, (data) => expect(aSingleDoc(data).source.type).toBe(expected));
      }
    });

    it('SObjects return the type', async () => {
      const properties: [
        {
          rawContent: string;
          filePath: string;
        },
        string,
      ][] = [
        [
          {
            rawContent: customObjectGenerator(),
            filePath: 'src/object/MyFirstObject__c.object-meta.xml',
          },
          'sobject',
        ],
      ];

      for (const [input, expected] of properties) {
        const result = await generateDocs([unparsedObjectBundleFromRawString(input)])();
        assertEither(result, (data) => expect(aSingleDoc(data).source.type).toBe(expected));
      }
    });

    it('do not return Apex files out of scope', async () => {
      const input1 = 'global class MyClass {}';
      const input2 = 'public class AnotherClass {}';

      const result = await generateDocs(
        [unparsedApexBundleFromRawString(input1), unparsedApexBundleFromRawString(input2)],
        {
          scope: ['global'],
        },
      )();
      expect(result).documentationBundleHasLength(1);
    });

    it('does not return non-deployed custom objects', async () => {
      const input = customObjectGenerator({ deploymentStatus: 'InDevelopment', visibility: 'Public' });

      const result = await generateDocs([unparsedObjectBundleFromRawString({ rawContent: input, filePath: 'test' })])();
      expect(result).documentationBundleHasLength(0);
    });

    it('does not return non-public custom objects', async () => {
      const input = customObjectGenerator({ deploymentStatus: 'Deployed', visibility: 'Protected' });

      const result = await generateDocs([unparsedObjectBundleFromRawString({ rawContent: input, filePath: 'test' })])();
      expect(result).documentationBundleHasLength(0);
    });

    it('do not return files that have an @ignore in the docs', async () => {
      const input = `
      /**
        * @ignore
        */
      public class MyClass {}`;

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(0);
    });
  });

  describe('the documentation content', () => {
    it('includes a heading with the type name', async () => {
      // TODO: A version of this for objects

      const properties: [string, string][] = [
        ['public class MyClass {}', 'MyClass Class'],
        ['public enum MyEnum {}', 'MyEnum Enum'],
        ['public interface MyInterface {}', 'MyInterface Interface'],
      ];

      for (const [input, expected] of properties) {
        const result = await generateDocs([unparsedApexBundleFromRawString(input)])();

        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains(expected));
      }
    });

    // TODO: Everything below here is just Apex specific, so it should go to its own file.

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
