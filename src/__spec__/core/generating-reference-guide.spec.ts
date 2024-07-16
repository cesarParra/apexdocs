import { assertEither, extendExpect } from './expect-extensions';
import { generateDocs } from '../../core/generate-docs';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import { apexBundleFromRawString } from './test-helpers';

describe('Generates a Reference Guide', () => {
  beforeAll(() => {
    extendExpect();
  });

  it('returns a reference guide with links to all other files', () => {
    const input1 = `
      public enum MyEnum {
        VALUE1,
        VALUE2
      }
      `;

    const input2 = `
      public class MyClass {}
      `;

    const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)]);
    expect(result).documentationBundleHasLength(2);

    assertEither(result, (data) => expect(data.referenceGuide).toContain('[MyEnum](./Miscellaneous/MyEnum.md)'));
    assertEither(result, (data) => expect(data.referenceGuide).toContain('[MyClass](./Miscellaneous/MyClass.md)'));
  });

  it('groups things under Miscellaneous if no group is provided', () => {
    const input = `
      public enum MyEnum {
        VALUE1,
        VALUE2
      }
      `;

    const result = generateDocs([apexBundleFromRawString(input)]);
    expect(result).documentationBundleHasLength(1);
    assertEither(result, (data) => expect(data.referenceGuide).toContain('## Miscellaneous'));
  });

  it('group things under the provided group', () => {
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
    assertEither(result, (data) => expect(data.referenceGuide).toContain('## MyGroup'));
  });

  it('displays groups in alphabetical order', () => {
    const input1 = `
      /**
        * @group ZGroup
        */
      public enum MyEnum {
        VALUE1,
        VALUE2
      }
      `;

    const input2 = `
      /**
        * @group AGroup
        */
      public class MyClass {}
      `;

    const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)]);
    expect(result).documentationBundleHasLength(2);
    pipe(
      result,
      E.map((data) => ({
        aGroupIndex: data.referenceGuide.indexOf('## AGroup'),
        zGroupIndex: data.referenceGuide.indexOf('## ZGroup'),
      })),
      E.match(
        () => fail('Expected data'),
        (data) => expect(data.aGroupIndex).toBeLessThan(data.zGroupIndex),
      ),
    );
  });

  it('displays references within groups in alphabetical order', () => {
    const input1 = `
      /**
        * @group Group1
        */
      public enum MyEnum {
        VALUE1,
        VALUE2
      }
      `;

    const input2 = `
      /**
        * @group Group1
        */
      public class MyClass {}
      `;

    const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)]);
    expect(result).documentationBundleHasLength(2);
    assertEither(result, (data) => expect(data.referenceGuide).toContain('## Group1'));
    assertEither(result, (data) => expect(data.referenceGuide).toContain('MyClass'));
    assertEither(result, (data) => expect(data.referenceGuide).toContain('MyEnum'));
  });

  it('returns a reference guide with descriptions', () => {
    const input1 = `
      /**
        * @description This is a description
        */
      public enum MyEnum {
        VALUE1,
        VALUE2
      }
      `;

    const input2 = `
      /**
        * @description This is a description
        */
      public class MyClass {}
      `;

    const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)]);
    expect(result).documentationBundleHasLength(2);
    assertEither(result, (data) => expect(data.referenceGuide).toContain('This is a description'));
  });

  it('returns a reference guide with descriptions with links to all other files', () => {
    const input1 = `
      /**
        * @description This is a description with a {@link MyClass}
        * @group Group1
        */
      public enum MyEnum {
        VALUE1,
        VALUE2
      }
      `;

    const input2 = `
      /**
        * @group Group2
        */
      public class MyClass {}
      `;

    const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)]);
    expect(result).documentationBundleHasLength(2);
    assertEither(result, (data) => expect(data.referenceGuide).toContain('with a [MyClass](./Group2/MyClass.md)'));
  });
});
