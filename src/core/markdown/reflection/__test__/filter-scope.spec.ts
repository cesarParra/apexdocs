import { ParsedFile } from '../../../shared/types';
import { ClassMirror, EnumMirror, InterfaceMirror, reflect } from '@cparra/apex-reflection';
import { filterScope } from '../filter-scope';

function parsedFileFromRawString(raw: string): ParsedFile {
  const { error, typeMirror } = reflect(raw);
  if (error) {
    throw new Error(error.message);
  }

  return {
    source: {
      filePath: 'test.cls',
      name: typeMirror!.name,
      type: typeMirror!.type_name,
    },
    type: typeMirror!,
  };
}

describe('When filtering scope', () => {
  it('filters out files with the @ignore annotation', () => {
    const properties: [string, number][] = [
      [
        `
        /**
         * @ignore
         */
        global class MyClass {}
        `,
        0,
      ],
      ['global class MyClass {}', 1],
    ];

    for (const [input, expected] of properties) {
      const parsedFile = parsedFileFromRawString(input);

      const result = filterScope(['global'], [parsedFile]);

      expect(result).toHaveLength(expected);
    }
  });

  describe('when scoping a class', () => {
    it('filters out methods tagged with @ignore', () => {
      const properties: [string, number][] = [
        [
          `
          global class MyClass {
            /**
             * @ignore
             */
            global void myMethod() {}
          }
          `,
          0,
        ],
        [
          `
          global class MyClass {
            global void myMethod() {}
          }
          `,
          1,
        ],
      ];

      for (const [input, expected] of properties) {
        const parsedFile = parsedFileFromRawString(input);

        const result = filterScope(['global'], [parsedFile]);

        expect((result[0].type as ClassMirror).methods).toHaveLength(expected);
      }
    });

    it('filters out properties tagged with @ignore', () => {
      const properties: [string, number][] = [
        [
          `
          global class MyClass {
            /**
             * @ignore
             */
            global Integer myProperty { get; set; }
          }
          `,
          0,
        ],
        [
          `
          global class MyClass {
            global Integer myProperty { get; set; }
          }
          `,
          1,
        ],
      ];

      for (const [input, expected] of properties) {
        const parsedFile = parsedFileFromRawString(input);

        const result = filterScope(['global'], [parsedFile]);

        expect((result[0].type as ClassMirror).properties).toHaveLength(expected);
      }
    });

    it('filters out fields tagged with @ignore', () => {
      const properties: [string, number][] = [
        [
          `
          global class MyClass {
            /**
             * @ignore
             */
            global Integer myField;
          }
          `,
          0,
        ],
        [
          `
          global class MyClass {
            global Integer myField;
          }
          `,
          1,
        ],
      ];

      for (const [input, expected] of properties) {
        const parsedFile = parsedFileFromRawString(input);

        const result = filterScope(['global'], [parsedFile]);

        expect((result[0].type as ClassMirror).fields).toHaveLength(expected);
      }
    });

    it('filters out inner classes tagged with @ignore', () => {
      const properties: [string, number][] = [
        [
          `
          global class MyClass {
            /**
             * @ignore
             */
            global class InnerClass {}
          }
          `,
          0,
        ],
        [
          `
          global class MyClass {
            global class InnerClass {}
          }
          `,
          1,
        ],
      ];

      for (const [input, expected] of properties) {
        const parsedFile = parsedFileFromRawString(input);

        const result = filterScope(['global'], [parsedFile]);

        expect((result[0].type as ClassMirror).classes).toHaveLength(expected);
      }
    });

    it('filters out inner interfaces tagged with @ignore', () => {
      const properties: [string, number][] = [
        [
          `
          global class MyClass {
            /**
             * @ignore
             */
            global interface InnerInterface {}
          }
          `,
          0,
        ],
        [
          `
          global class MyClass {
            global interface InnerInterface {}
          }
          `,
          1,
        ],
      ];

      for (const [input, expected] of properties) {
        const parsedFile = parsedFileFromRawString(input);

        const result = filterScope(['global'], [parsedFile]);

        expect((result[0].type as ClassMirror).interfaces).toHaveLength(expected);
      }
    });

    it('filters out inner enums tagged with @ignore', () => {
      const properties: [string, number][] = [
        [
          `
          global class MyClass {
            /**
             * @ignore
             */
            global enum InnerEnum {}
          }
          `,
          0,
        ],
        [
          `
          global class MyClass {
            global enum InnerEnum {}
          }
          `,
          1,
        ],
      ];

      for (const [input, expected] of properties) {
        const parsedFile = parsedFileFromRawString(input);

        const result = filterScope(['global'], [parsedFile]);

        expect((result[0].type as ClassMirror).enums).toHaveLength(expected);
      }
    });
  });

  describe('when scoping an interface', () => {
    it('filters out methods tagged with @ignore', () => {
      const properties: [string, number][] = [
        [
          `
          global interface MyInterface {
            /**
             * @ignore
             */
            void myMethod();
          }
          `,
          0,
        ],
        [
          `
          global interface MyInterface {
            void myMethod();
          }
          `,
          1,
        ],
      ];

      for (const [input, expected] of properties) {
        const parsedFile = parsedFileFromRawString(input);

        const result = filterScope(['global'], [parsedFile]);

        expect((result[0].type as InterfaceMirror).methods).toHaveLength(expected);
      }
    });
  });

  describe('when scoping an enum', () => {
    it('never filters out enum values, even if tagged with @ignore', () => {
      const properties: [string, number][] = [
        [
          `
          global enum MyEnum {
            /**
             * @ignore
             */
            VALUE
          }
          `,
          1,
        ],
        [
          `
          global enum MyEnum {
            VALUE
          }
          `,
          1,
        ],
      ];

      for (const [input, expected] of properties) {
        const parsedFile = parsedFileFromRawString(input);

        const result = filterScope(['global'], [parsedFile]);

        expect((result[0].type as EnumMirror).values).toHaveLength(expected);
      }
    });
  });
});
