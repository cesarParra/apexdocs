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
        <label>MyTestObject</label>
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
    it('includes a heading with the type name for Apex code', async () => {
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

    it('includes a heading with the Custom Object label', async () => {
      const input = customObjectGenerator();

      const result = await generateDocs([unparsedObjectBundleFromRawString({ rawContent: input, filePath: 'test' })])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('MyTestObject'));
    });
  });
});
