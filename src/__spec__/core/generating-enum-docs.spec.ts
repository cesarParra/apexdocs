import { DocOutput, generateDocs } from '../../core/generate-docs';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';

function assertEither<T>(result: E.Either<string, T>, assertion: (data: T) => void): void {
  E.match<string, T, void>(
    (error) => fail(error),
    (data) => assertion(data),
  )(result);
}

describe('Generates enum documentation', () => {
  describe('documentation output', () => {
    it('always returns markdown as the format', () => {
      const input = `
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs(input);
      assertEither(result, (data) => expect(data.format).toBe('markdown'));
    });

    it('returns the name of the enum', () => {
      const input = `
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs(input);
      assertEither(result, (data) => expect(data.typeName).toBe('MyEnum'));
    });

    it('returns the type as enum', () => {
      const input = `
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs(input);
      assertEither(result, (data) => expect(data.type).toBe('enum'));
    });

    it('returns the group as None when there is no group', () => {
      const input = `
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs(input);
      assertEither(result, (data) => expect(data.group).toBe(O.none));
    });

    it('returns the group as Some when there is a group', () => {
      const input = `
     /**
      * @group MyGroup
      */
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs(input);
      assertEither(result, (data) => expect(data.group).toEqual(O.some('MyGroup')));
    });
  });

  describe('documentation content', () => {
    it('generates a heading with the enum name', () => {
      const input = `
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const output = `# MyEnum Enum`;

      const result = generateDocs(input);
      E.match<string, DocOutput, void>(
        (error) => fail(error),
        (data) => expect(data.docContents).toContain(output),
      )(result);
    });
  });
});
