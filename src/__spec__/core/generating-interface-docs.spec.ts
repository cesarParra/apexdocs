import { assertEither, extendExpect } from './expect-extensions';
import { generateDocs } from '../../core/generate-docs';

describe('Generates interface documentation', () => {
  beforeAll(() => {
    extendExpect();
  });

  describe('documentation output', () => {
    it('always returns markdown as the format', () => {
      const input = `
      public interface MyInterface {
      }
     `;

      const result = generateDocs([input]);
      assertEither(result, (data) => expect(data.format).toBe('markdown'));
    });

    it('returns the name of the interface', () => {
      const input = `
      public interface MyInterface {
      }
      `;

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].typeName).toBe('MyInterface'));
    });

    it('returns the type as interface', () => {
      const input = `
      public interface MyInterface {
      }
      `;

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].type).toBe('interface'));
    });

    it('does not return interfaces out of scope', () => {
      const input1 = `
        global interface MyInterface {}
      `;

      const input2 = `
        public interface AnotherInterface {}
      `;

      const result = generateDocs([input1, input2], { scope: ['global'] });
      expect(result).documentationBundleHasLength(1);
    });

    it('does not return interfaces that have an @ignore in the docs', () => {
      const input = `
      /**
        * @ignore
        */
      public interface MyInterface {}`;

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(0);
    });

    it('does not return interface methods that have @ignore in the docs', () => {
      const input = `
      public interface MyInterface {
        /**
          * @ignore
          */
        void myMethod();
      }`;

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].docContents).not.toContain('myMethod'));
    });
  });

  describe('documentation content', () => {
    it('generates a heading with the interface name', () => {
      const input = `
        public interface MyInterface {}
      `;

      const output = `# MyInterface Interface`;
      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains(output));
    });

    it('displays type level annotations', () => {
      const input = `
        @NamespaceAccessible
        public interface MyEnum {
          @Deprecated
          void myMethod();   
        }
       `;

      const result = generateDocs([input]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('NAMESPACEACCESSIBLE'));
      assertEither(result, (data) => expect(data).firstDocContains('DEPRECATED'));
    });
  });
});

// TODO: Methods
