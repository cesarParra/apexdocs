import { assertEither, extendExpect } from './expect-extensions';
import { apexBundleFromRawString, generateDocs } from './test-helpers';

describe('When generating documentation for a class', () => {
  beforeAll(() => {
    extendExpect();
  });

  describe('member information', () => {
    it('displays the Method heading', async () => {
      const input = `
        public class MyClass {
          public void myMethod() {}
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Methods'));
    });

    it('sorts methods when sorting members alphabetically', async () => {
      const input = `
        public class MyClass {
          public void zMethod() {}
          public void aMethod() {}
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: true })();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aMethodIndex = data.docs[0].content.indexOf('aMethod');
        const zMethodIndex = data.docs[0].content.indexOf('zMethod');
        expect(aMethodIndex).toBeLessThan(zMethodIndex);
      });
    });

    it('does not sort methods when not sorting members alphabetically', async () => {
      const input = `
        public class MyClass {
          public void zMethod() {}
          public void aMethod() {}
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: false })();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aMethodIndex = data.docs[0].content.indexOf('aMethod');
        const zMethodIndex = data.docs[0].content.indexOf('zMethod');
        expect(aMethodIndex).toBeGreaterThan(zMethodIndex);
      });
    });

    it('displays the Property heading', async () => {
      const input = `
        public class MyClass {
          public String myProperty { get; set; }
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Properties'));
    });

    it('sorts properties when sorting members alphabetically', async () => {
      const input = `
        public class MyClass {
          public String zProperty { get; set; }
          public String aProperty { get; set; }
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: true })();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aPropertyIndex = data.docs[0].content.indexOf('aProperty');
        const zPropertyIndex = data.docs[0].content.indexOf('zProperty');
        expect(aPropertyIndex).toBeLessThan(zPropertyIndex);
      });
    });

    it('does not sort properties when not sorting members alphabetically', async () => {
      const input = `
        public class MyClass {
          public String zProperty { get; set; }
          public String aProperty { get; set; }
        }  
      `;

      const result = await generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: false })();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aPropertyIndex = data.docs[0].content.indexOf('aProperty');
        const zPropertyIndex = data.docs[0].content.indexOf('zProperty');
        expect(aPropertyIndex).toBeGreaterThan(zPropertyIndex);
      });
    });

    it('displays the Field heading', async () => {
      const input = `
        public class MyClass {
          public String myField;
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Fields'));
    });

    it('sort fields when sorting members alphabetically', async () => {
      const input = `
        public class MyClass {
          public String zField;
          public String aField;
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: true })();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aFieldIndex = data.docs[0].content.indexOf('aField');
        const zFieldIndex = data.docs[0].content.indexOf('zField');
        expect(aFieldIndex).toBeLessThan(zFieldIndex);
      });
    });

    it('does not sort fields when not sorting members alphabetically', async () => {
      const input = `
        public class MyClass {
          public String zField;
          public String aField;
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: false })();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aFieldIndex = data.docs[0].content.indexOf('aField');
        const zFieldIndex = data.docs[0].content.indexOf('zField');
        expect(aFieldIndex).toBeGreaterThan(zFieldIndex);
      });
    });

    it('displays the Constructor heading', async () => {
      const input = `
        public class MyClass {
          public MyClass() {}
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Constructors'));
    });

    it('displays the Inner Class heading', async () => {
      const input = `
        public class MyClass {
          public class InnerClass {}
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Classes'));
    });

    it('sorts inner classes when sorting members alphabetically', async () => {
      const input = `
        public class MyClass {
          public class ZInnerClass {}
          public class AInnerClass {}
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: true })();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aInnerClassIndex = data.docs[0].content.indexOf('AInnerClass');
        const zInnerClassIndex = data.docs[0].content.indexOf('ZInnerClass');
        expect(aInnerClassIndex).toBeLessThan(zInnerClassIndex);
      });
    });

    it('does not sort inner classes when not sorting members alphabetically', async () => {
      const input = `
        public class MyClass {
          public class ZInnerClass {}
          public class AInnerClass {}
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: false })();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aInnerClassIndex = data.docs[0].content.indexOf('AInnerClass');
        const zInnerClassIndex = data.docs[0].content.indexOf('ZInnerClass');
        expect(aInnerClassIndex).toBeGreaterThan(zInnerClassIndex);
      });
    });

    it('displays the Inner Interface heading', async () => {
      const input = `
        public class MyClass {
          public interface InnerInterface {}
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Interfaces'));
    });

    it('sorts inner interfaces when sorting members alphabetically', async () => {
      const input = `
        public class MyClass {
          public interface ZInnerInterface {}
          public interface AInnerInterface {}
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: true })();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aInnerInterfaceIndex = data.docs[0].content.indexOf('AInnerInterface');
        const zInnerInterfaceIndex = data.docs[0].content.indexOf('ZInnerInterface');
        expect(aInnerInterfaceIndex).toBeLessThan(zInnerInterfaceIndex);
      });
    });

    it('does not sort inner interfaces when not sorting members alphabetically', async () => {
      const input = `
        public class MyClass {
          public interface ZInnerInterface {}
          public interface AInnerInterface {}
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: false })();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aInnerInterfaceIndex = data.docs[0].content.indexOf('AInnerInterface');
        const zInnerInterfaceIndex = data.docs[0].content.indexOf('ZInnerInterface');
        expect(aInnerInterfaceIndex).toBeGreaterThan(zInnerInterfaceIndex);
      });
    });

    it('displays the Inner Enum heading', async () => {
      const input = `
        public class MyClass {
          public enum InnerEnum {}
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Enums'));
    });

    it('sort inner enums when sorting members alphabetically', async () => {
      const input = `
        public class MyClass {
          public enum ZInnerEnum {}
          public enum AInnerEnum {}
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: true })();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aInnerEnumIndex = data.docs[0].content.indexOf('AInnerEnum');
        const zInnerEnumIndex = data.docs[0].content.indexOf('ZInnerEnum');
        expect(aInnerEnumIndex).toBeLessThan(zInnerEnumIndex);
      });
    });

    it('does not sort inner enums when not sorting members alphabetically', async () => {
      const input = `
        public class MyClass {
          public enum ZInnerEnum {}
          public enum AInnerEnum {}
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: false })();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aInnerEnumIndex = data.docs[0].content.indexOf('AInnerEnum');
        const zInnerEnumIndex = data.docs[0].content.indexOf('ZInnerEnum');
        expect(aInnerEnumIndex).toBeGreaterThan(zInnerEnumIndex);
      });
    });

    it('supports having mermaid diagrams in descriptions', async () => {
      const input = `
        public class MyClass {
          /**
            * @mermaid
            * \`\`\`mermaid
            * graph TD
            *   A[Square Rect] -- Link text --> B((Circle))
            *   A --> C(Round Rect)
            *   B --> D{Rhombus}
            *   C --> D
            * \`\`\`
            */
          public void myMethod() {}
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('```mermaid'));
      assertEither(result, (data) => expect(data).firstDocContains('graph TD'));
    });

    it('supports having example code blocks in method descriptions', async () => {
      const input = `
        public class MyClass {
          /**
            * @example
            * public class MyClass {
            *   public void myMethod() {
            *     System.debug('Hello, World!');
            *   }
            * }
            */
          public void myMethod() {}
        }
      `;

      const result = await generateDocs([apexBundleFromRawString(input)])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('```apex'));
      assertEither(result, (data) => expect(data).firstDocContains('public class MyClass'));
    });

    it('displays an "inherited" tag if the method was inherited from a different interface', async () => {
      const input1 = `
        public virtual class MyClass {
          public void myMethod() {}
        }
      `;

      const input2 = `
        public class AnotherClass extends MyClass {}
      `;

      const result = await generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)])();
      expect(result).documentationBundleHasLength(2);
      assertEither(result, (data) =>
        expect(data.docs.find((doc) => doc.source.name === 'AnotherClass')?.content).toContain('Inherited'),
      );
    });
  });
});

// TODO: Skips tags at the member level
