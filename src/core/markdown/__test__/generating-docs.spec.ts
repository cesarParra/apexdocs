import { DocPageData, PostHookDocumentationBundle } from '../../shared/types';
import { assertEither, extendExpect } from './expect-extensions';
import { apexBundleFromRawString, generateDocs } from './test-helpers';

function aSingleDoc(result: PostHookDocumentationBundle): DocPageData {
  expect(result.docs).toHaveLength(1);
  return result.docs[0];
}

describe('When generating documentation', () => {
  beforeAll(() => {
    extendExpect();
  });

  describe('the resulting files', () => {
    it('are named after the type', async () => {
      const properties: [string, string][] = [
        ['public class MyClass {}', 'MyClass.md'],
        ['public interface MyInterface {}', 'MyInterface.md'],
        ['public enum MyEnum {}', 'MyEnum.md'],
      ];

      for (const [input, expected] of properties) {
        const result = await generateDocs([apexBundleFromRawString(input)])();
        assertEither(result, (data) => expect(aSingleDoc(data).outputDocPath).toContain(expected));
      }
    });

    it('are placed in the miscellaneous folder if no group is provided', async () => {
      const properties: [string, string][] = [
        ['public class MyClass {}', 'miscellaneous'],
        ['public interface MyInterface {}', 'miscellaneous'],
        ['public enum MyEnum {}', 'miscellaneous'],
      ];

      for (const [input, expected] of properties) {
        const result = await generateDocs([apexBundleFromRawString(input)])();
        assertEither(result, (data) => expect(aSingleDoc(data).outputDocPath).toContain(expected));
      }
    });

    it('are placed in the slugified group folder if a group is provided', async () => {
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
        const result = await generateDocs([apexBundleFromRawString(input)])();
        assertEither(result, (data) => expect(aSingleDoc(data).outputDocPath).toContain(expected));
      }
    });
  });

  describe('the generated bundles', () => {
    it('return the type', async () => {
      const properties: [string, string][] = [
        ['public class MyClass {}', 'class'],
        ['public interface MyInterface {}', 'interface'],
        ['public enum MyEnum {}', 'enum'],
      ];

      for (const [input, expected] of properties) {
        const result = await generateDocs([apexBundleFromRawString(input)])();
        assertEither(result, (data) => expect(aSingleDoc(data).source.type).toBe(expected));
      }
    });
  });

  describe('the generated bundle', () => {
    it('does not return files out of scope', async () => {
      const input1 = 'global class MyClass {}';
      const input2 = 'public class AnotherClass {}';

      const result = await generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)], {
        scope: ['global'],
      })();
      expect(result).documentationBundleHasLength(1);
    });
  });
});
