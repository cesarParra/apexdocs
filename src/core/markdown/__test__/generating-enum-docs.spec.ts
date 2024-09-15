import { assertEither, extendExpect } from './expect-extensions';
import { apexBundleFromRawString, generateDocs } from './test-helpers';

describe('Generates enum documentation', () => {
  beforeAll(() => {
    extendExpect();
  });

  describe('documentation content', () => {
    it('displays values', async () => {
      const input = `
      public enum MyEnum {
        VALUE1,
        VALUE2
      }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Values'));
      assertEither(result, (data) => expect(data).firstDocContains('VALUE1'));
      assertEither(result, (data) => expect(data).firstDocContains('VALUE2'));
    });

    it('displays values sorted when sortAlphabetically is true', async () => {
      const input = `
      public enum MyEnum {
        VALUE2,
        VALUE1
      }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)], { sortAlphabetically: true })();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Values'));
      assertEither(result, (data) => {
        const value1Index = data.docs[0].content.indexOf('VALUE1');
        const value2Index = data.docs[0].content.indexOf('VALUE2');
        expect(value1Index).toBeLessThan(value2Index);
      });
    });

    it('does not sort values when sortAlphabetically is false', async () => {
      const input = `
      public enum MyEnum {
        VALUE2,
        VALUE1
      }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)], { sortAlphabetically: false })();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Values'));
      assertEither(result, (data) => {
        const value1Index = data.docs[0].content.indexOf('VALUE1');
        const value2Index = data.docs[0].content.indexOf('VALUE2');
        expect(value1Index).toBeGreaterThan(value2Index);
      });
    });
  });
});
