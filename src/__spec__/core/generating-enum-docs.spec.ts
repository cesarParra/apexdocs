import { generateDocs } from '../../core/generate-docs';
import * as E from 'fp-ts/Either';

describe('Generates enum documentation', () => {
  it('generates a heading with the enum name', () => {
    const input = `
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

    const output = `# MyEnum Enum`;

    const result = generateDocs(input);
    E.match(
      (error) => fail(error),
      (data) => expect(data).toContain(output),
    )(result);
  });
});
