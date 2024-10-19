import { extendExpect } from './expect-extensions';
import { unparsedApexBundleFromRawString, generateDocs } from './test-helpers';
import { assertEither } from '../../test-helpers/assert-either';

// TODO: Create a test similar to this.
// TODO: Make sure to test the output for every single type of field supported

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

      const result = await generateDocs([unparsedApexBundleFromRawString(input)])();
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

      const result = await generateDocs([unparsedApexBundleFromRawString(input)], { sortAlphabetically: true })();
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

      const result = await generateDocs([unparsedApexBundleFromRawString(input)], { sortAlphabetically: false })();
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
