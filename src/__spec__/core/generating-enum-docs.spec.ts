import { DocOutput, generateDocs } from '../../core/generate-docs';
import * as E from 'fp-ts/Either';

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
      E.match<string, DocOutput, void>(
        (error) => fail(error),
        (data) => expect(data.format).toBe('markdown'),
      )(result);
    });
  });

  // TODO: Correct type name
  // TODO: Correct type
  // TODO: Correct group

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
