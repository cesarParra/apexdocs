import { parsedFileFromRawString } from './helpers';
import { removeExcludedTags } from '../remove-excluded-tags';

describe('when removing excluded tags', () => {
  describe('from the type level', () => {
    it('removes annotations', () => {
      const tagsToExclude = ['group'];
      const content = `
        /**
         * @group MyGroup
         * @custom myCustomTag
         */
        global class MyClass {}
        `;
      const parsedFile = parsedFileFromRawString(content);

      const result = removeExcludedTags(tagsToExclude, [parsedFile]);

      expect(result[0].type.docComment?.annotations).toHaveLength(1);
      expect(result[0].type.docComment?.annotations[0].name).toBe('custom');
    });

    it('removes example annotations', () => {
      const tagsToExclude = ['example'];
      const content = `
        /**
         * @example
         * This is my example
         * public void myMethod() {}
         */
        global class MyClass {}
        `;
      const parsedFile = parsedFileFromRawString(content);

      const result = removeExcludedTags(tagsToExclude, [parsedFile]);

      expect(result[0].type.docComment?.exampleAnnotation).toBeNull();
    });
  });
});

// From type level
// description | descriptionLines
// example
// param
// return
// throws
// Custom tags
// case insensitive
// Interfaces Method level
// Classes Member level
