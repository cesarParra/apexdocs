import { DocumentationBundle, generateDocs } from '../../core/generate-docs';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';

expect.extend({
  documentationBundleHasLength(received: E.Either<string[], DocumentationBundle>, length: number) {
    return {
      pass: E.isRight(received) && received.right.docs.length === length,
      message: () => `Expected documentation bundle to have length ${length}`,
    };
  },
  firstDocContains(doc: DocumentationBundle, content: string) {
    return {
      pass: doc.docs[0].docContents.includes(content),
      message: () => `Expected documentation to contain ${content}. Got ${doc.docs[0].docContents}`,
    };
  },
});

function assertEither<T, U>(result: E.Either<T, U>, assertion: (data: U) => void): void {
  E.match<T, U, void>(
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

      const result = generateDocs([input]);
      assertEither(result, (data) => expect(data.format).toBe('markdown'));
    });

    it('returns the name of the enum', () => {
      const input = `
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].typeName).toBe('MyEnum'));
    });

    it('returns the type as enum', () => {
      const input = `
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].type).toBe('enum'));
    });

    it('returns the group as None when there is no group', () => {
      const input = `
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].group).toBe(O.none));
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

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].group).toEqual(O.some('MyGroup')));
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

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains(output));
    });

    it('displays type level annotations', () => {
      const input = `
     @NamespaceAccessible
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('NAMESPACEACCESSIBLE'));
    });

    it('displays the description', () => {
      const input = `
     /**
      * This is a description
      */
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('This is a description'));
    });

    it('display custom documentation tags', () => {
      const input = `
     /**
      * @custom-tag My Value
      */
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('Custom Tag'));
      assertEither(result, (data) => expect(data).firstDocContains('My Value'));
    });

    it('displays the group', () => {
      const input = `
     /**
      * @group MyGroup
      */
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('Group'));
      assertEither(result, (data) => expect(data).firstDocContains('MyGroup'));
    });

    it('displays the author', () => {
      const input = `
     /**
      * @author John Doe
      */
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('Author'));
      assertEither(result, (data) => expect(data).firstDocContains('John Doe'));
    });

    it('displays the date', () => {
      const input = `
     /**
      * @date 2021-01-01
      */
     public enum MyEnum {
        VALUE1,
        VALUE2
      }
    `;

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('Date'));
      assertEither(result, (data) => expect(data).firstDocContains('2021-01-01'));
    });

    it('displays sees with accurately resolved links', () => {
      const input1 = `
      /**
        * @see EnumRef
        */
      public enum MyEnum {}
      `;

      const input2 = 'public enum EnumRef {}';

      const result = generateDocs([input1, input2]);
      expect(result).documentationBundleHasLength(2);
      assertEither(result, (data) => expect(data).firstDocContains('See'));
      assertEither(result, (data) => expect(data).firstDocContains('[EnumRef](./EnumRef.md)'));
    });
  });
});

// TODO: Sees with links
// TODO: Sees without links
// TODO: description without links
// TODO: description with links
// TODO: description with emails
// TODO: Namespace when one is present
// TODO: Namespace when one is not present
// TODO: Mermaid
// TODO: Example
// TODO: Heading for values
// TODO: Table for values
// TODO: Taking into account links
// TODO: Ability to have this: https://github.com/cesarParra/apexdocs/blob/adff32a3a085305ae119b3ad11ef6157ecdcd32f/src/model/markdown-generation-util/type-declaration-util.ts#L75

// TODO: scoping works
// TODO: @ignore works
// TODO: Linking logic should be tested as its own thing
