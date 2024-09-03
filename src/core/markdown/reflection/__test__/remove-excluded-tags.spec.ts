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

    it('removes params annotations', () => {
      const tagsToExclude = ['param'];
      const content = `
        /**
         * @param myParam
         * public void myMethod() {}
         */
        global class MyClass {}
        `;
      const parsedFile = parsedFileFromRawString(content);

      const result = removeExcludedTags(tagsToExclude, [parsedFile]);

      expect(result[0].type.docComment?.paramAnnotations).toHaveLength(0);
    });

    it('removes the return annotation', () => {
      const tagsToExclude = ['return'];
      const content = `
        /**
         * @return myReturn
         * public void myMethod() {}
         */
        global class MyClass {}
        `;
      const parsedFile = parsedFileFromRawString(content);

      const result = removeExcludedTags(tagsToExclude, [parsedFile]);

      expect(result[0].type.docComment?.returnAnnotation).toBeNull();
    });

    it('removes the throws annotations', () => {
      const tagsToExclude = ['throws'];
      const content = `
        /**
         * @throws MyException
         * public void myMethod() {}
         */
        global class MyClass {}
        `;
      const parsedFile = parsedFileFromRawString(content);

      const result = removeExcludedTags(tagsToExclude, [parsedFile]);

      expect(result[0].type.docComment?.throwsAnnotations).toHaveLength(0);
    });
  });
});

// From type level
// description | descriptionLines
// throws
// exception
// Custom tags
// case insensitive
// Interfaces Method level
// Classes Member level
