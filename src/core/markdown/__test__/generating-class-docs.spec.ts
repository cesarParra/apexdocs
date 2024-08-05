import { assertEither, extendExpect } from './expect-extensions';
import { apexBundleFromRawString, generateDocs } from './test-helpers';

describe('Generates interface documentation', () => {
  beforeAll(() => {
    extendExpect();
  });

  describe('documentation output', () => {
    it('returns the name of the class', () => {
      const input = 'public class MyClass {}';

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].fileName).toBe('MyClass'));
    });

    it('returns the type as class', () => {
      const input = 'public class MyClass {}';

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].source.type).toBe('class'));
    });

    it('does not return classes out of scope', () => {
      const input1 = `
        global class MyClass {}
      `;

      const input2 = `
        public class AnotherClass {}
      `;

      const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)], {
        scope: ['global'],
      });
      expect(result).documentationBundleHasLength(1);
    });

    it('does not return classes that have an @ignore in the docs', () => {
      const input = `
      /**
        * @ignore
        */
      public class MyClass {}`;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(0);
    });

    it('does not return class methods that have @ignore in the docs', () => {
      const input = `
      public class MyClass {
        /**
          * @ignore
          */
        public void myMethod() {}
      }`;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].content).not.toContain('myMethod'));
    });

    it('does not return class properties that have @ignore in the docs', () => {
      const input = `
      public class MyClass {
        /**
          * @ignore
          */
        public String myProperty { get; set; }
      }`;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].content).not.toContain('myProperty'));
    });

    it('does not return class fields that have @ignore in the docs', () => {
      const input = `
      public class MyClass {
        /**
          * @ignore
          */
        public String myField;
      }`;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].content).not.toContain('myField'));
    });

    it('does not return class inner classes that have @ignore in the docs', () => {
      const input = `
      public class MyClass {
        /**
          * @ignore
          */
        public class InnerClass {}
      }`;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].content).not.toContain('InnerClass'));
    });

    it('does not return class inner interfaces that have @ignore in the docs', () => {
      const input = `
      public class MyClass {
        /**
          * @ignore
          */
        public interface InnerInterface {}
      }`;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].content).not.toContain('InnerInterface'));
    });

    it('does not return class inner enums that have @ignore in the docs', () => {
      const input = `
      public class MyClass {
        /**
          * @ignore
          */
        public enum InnerEnum {}
      }`;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data.docs[0].content).not.toContain('InnerEnum'));
    });
  });

  describe('documentation content', () => {
    describe('type level information', () => {
      it('generates a heading with the class name', () => {
        const input = 'public class MyClass {}';

        const output = `# MyClass Class`;
        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains(output));
      });

      it('displays type level annotations', () => {
        const input = `
        @NamespaceAccessible
        public class MyClass {
          @Deprecated
          public void myMethod() {}
        }
       `;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('NAMESPACEACCESSIBLE'));
        assertEither(result, (data) => expect(data).firstDocContains('DEPRECATED'));
      });

      it('displays metadata as annotations', () => {
        const input = 'public class MyClass {}';
        const metadata = `
        <?xml version="1.0" encoding="UTF-8"?>
        <ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
            <apiVersion>59.0</apiVersion>
            <status>Active</status>
        </ApexClass>
        `;

        const result = generateDocs([apexBundleFromRawString(input, metadata)]);

        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('APIVERSION'));
        assertEither(result, (data) => expect(data).firstDocContains('STATUS'));
      });

      it('displays the description', () => {
        const input = `
          /**
           * This is a description
           */
          public class MyClass {}
         `;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('This is a description'));
      });

      it('display custom documentation tags', () => {
        const input = `
          /**
           * @custom-tag My Value
           */
          public class MyClass {}
        `;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('Custom Tag'));
        assertEither(result, (data) => expect(data).firstDocContains('My Value'));
      });

      it('displays the group', () => {
        const input = `
          /**
           * @group MyGroup
           */
          public class MyClass {}`;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('Group'));
        assertEither(result, (data) => expect(data).firstDocContains('MyGroup'));
      });

      it('displays the author', () => {
        const input = `
          /**
           * @author John Doe
           */
          public class MyClass {}`;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('Author'));
        assertEither(result, (data) => expect(data).firstDocContains('John Doe'));
      });

      it('displays the date', () => {
        const input = `
          /**
           * @date 2021-01-01
           */
          public class MyClass {}`;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('Date'));
        assertEither(result, (data) => expect(data).firstDocContains('2021-01-01'));
      });

      it('displays descriptions', () => {
        const input = `
          /**
            * @description This is a description
            */
          public class MyClass {}`;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('This is a description'));
      });

      it('displays descriptions with links', () => {
        const input1 = `
          /**
            * @description This is a description with a {@link ClassRef} reference
            */
          public enum MyClass {}
          `;

        const input2 = 'public class ClassRef {}';

        const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)]);
        expect(result).documentationBundleHasLength(2);
        assertEither(result, (data) =>
          expect(data).firstDocContains('This is a description with a [ClassRef](./ClassRef.md) reference'),
        );
      });

      it('displays descriptions with emails', () => {
        const input = `
          /**
            * @description This is a description with an {@email test@testerson.com} email
            */
          public class MyClass {}
          `;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) =>
          expect(data).firstDocContains(
            'This is a description with an [test@testerson.com](mailto:test@testerson.com) email',
          ),
        );
      });

      it('displays sees with accurately resolved links', () => {
        const input1 = `
          /**
            * @see ClassRef
            */
          public class MyClass {}
          `;

        const input2 = 'public class ClassRef {}';

        const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)]);
        expect(result).documentationBundleHasLength(2);
        assertEither(result, (data) => expect(data).firstDocContains('See'));
        assertEither(result, (data) => expect(data).firstDocContains('[ClassRef](./ClassRef.md)'));
      });

      it('displays sees without links when the reference is not found', () => {
        const input = `
          /**
            * @see ClassRef
            */
          public class MyClass {}
          `;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('See'));
        assertEither(result, (data) => expect(data).firstDocContains('ClassRef'));
      });

      it('displays the namespace if present in the config', () => {
        const input = 'public class MyClass {}';

        const result = generateDocs([apexBundleFromRawString(input)], { namespace: 'MyNamespace' });
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('## Namespace'));
        assertEither(result, (data) => expect(data).firstDocContains('MyNamespace'));
      });

      it('does not display the namespace if not present in the config', () => {
        const input = 'public class MyClass {}';

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContainsNot('## Namespace'));
      });

      it('displays a mermaid diagram', () => {
        const input = `
          /**
            * @mermaid
            * graph TD
            *   A[Square Rect] -- Link text --> B((Circle))
            *   A --> C(Round Rect)
            *   B --> D{Rhombus}
            *   C --> D
            */
          public class MyClass {}
          `;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('```mermaid'));
        assertEither(result, (data) => expect(data).firstDocContains('graph TD'));
      });

      it('displays an example code block', () => {
        const input = `
          /**
            * @example
            * public class MyClass {
            *   public void myMethod() {
            *     System.debug('Hello, World!');
            *   }
            * }
            */
          public class MyClass {}`;

        const result = generateDocs([apexBundleFromRawString(input)]);
        expect(result).documentationBundleHasLength(1);
        assertEither(result, (data) => expect(data).firstDocContains('```apex'));
        assertEither(result, (data) => expect(data).firstDocContains('public class MyClass'));
      });
    });
  });

  describe('member information', () => {
    it('displays the Method heading', () => {
      const input = `
        public class MyClass {
          public void myMethod() {}
        }
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Methods'));
    });

    it('displays the Property heading', () => {
      const input = `
        public class MyClass {
          public String myProperty { get; set; }
        }
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Properties'));
    });

    it('displays the Field heading', () => {
      const input = `
        public class MyClass {
          public String myField;
        }
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Fields'));
    });

    it('sort fields when sorting members alphabetically', () => {
      const input = `
        public class MyClass {
          public String zField;
          public String aField;
        }
      `;

      const result = generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: true });
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aFieldIndex = data.docs[0].content.indexOf('aField');
        const zFieldIndex = data.docs[0].content.indexOf('zField');
        expect(aFieldIndex).toBeLessThan(zFieldIndex);
      });
    });

    it('does not sort fields when not sorting members alphabetically', () => {
      const input = `
        public class MyClass {
          public String zField;
          public String aField;
        }
      `;

      const result = generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: false });
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aFieldIndex = data.docs[0].content.indexOf('aField');
        const zFieldIndex = data.docs[0].content.indexOf('zField');
        expect(aFieldIndex).toBeGreaterThan(zFieldIndex);
      });
    });

    it('displays the Constructor heading', () => {
      const input = `
        public class MyClass {
          public MyClass() {}
        }
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Constructors'));
    });

    it('displays the Inner Class heading', () => {
      const input = `
        public class MyClass {
          public class InnerClass {}
        }
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Classes'));
    });

    it('sorts inner classes when sorting members alphabetically', () => {
      const input = `
        public class MyClass {
          public class ZInnerClass {}
          public class AInnerClass {}
        }
      `;

      const result = generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: true });
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aInnerClassIndex = data.docs[0].content.indexOf('AInnerClass');
        const zInnerClassIndex = data.docs[0].content.indexOf('ZInnerClass');
        expect(aInnerClassIndex).toBeLessThan(zInnerClassIndex);
      });
    });

    it('does not sort inner classes when not sorting members alphabetically', () => {
      const input = `
        public class MyClass {
          public class ZInnerClass {}
          public class AInnerClass {}
        }
      `;

      const result = generateDocs([apexBundleFromRawString(input)], { sortMembersAlphabetically: false });
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => {
        const aInnerClassIndex = data.docs[0].content.indexOf('AInnerClass');
        const zInnerClassIndex = data.docs[0].content.indexOf('ZInnerClass');
        expect(aInnerClassIndex).toBeGreaterThan(zInnerClassIndex);
      });
    });

    it('displays the Inner Interface heading', () => {
      const input = `
        public class MyClass {
          public interface InnerInterface {}
        }
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Interfaces'));
    });

    it('displays the Inner Enum heading', () => {
      const input = `
        public class MyClass {
          public enum InnerEnum {}
        }
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Enums'));
    });

    it('supports having mermaid diagrams in descriptions', () => {
      const input = `
        public class MyClass {
          /**
            * @mermaid
            * graph TD
            *   A[Square Rect] -- Link text --> B((Circle))
            *   A --> C(Round Rect)
            *   B --> D{Rhombus}
            *   C --> D
            */
          public void myMethod() {}
        }
      `;

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('```mermaid'));
      assertEither(result, (data) => expect(data).firstDocContains('graph TD'));
    });

    it('supports having example code blocks in method descriptions', () => {
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

      const result = generateDocs([apexBundleFromRawString(input)]);
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('```apex'));
      assertEither(result, (data) => expect(data).firstDocContains('public class MyClass'));
    });

    it('displays an "inherited" tag if the method was inherited from a different interface', () => {
      const input1 = `
        public virtual class MyClass {
          public void myMethod() {}
        }
      `;

      const input2 = `
        public class AnotherClass extends MyClass {}
      `;

      const result = generateDocs([apexBundleFromRawString(input1), apexBundleFromRawString(input2)]);
      expect(result).documentationBundleHasLength(2);
      assertEither(result, (data) =>
        expect(data.docs.find((doc) => doc.source.name === 'AnotherClass')?.content).toContain('Inherited'),
      );
    });
  });
});
