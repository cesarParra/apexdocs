import { extendExpect } from './expect-extensions';
import { customFieldPickListValues, generateDocs, unparsedObjectBundleFromRawString } from './test-helpers';
import { assertEither } from '../../test-helpers/assert-either';
import { unparsedFieldBundleFromRawString } from '../../test-helpers/test-data-builders';
import { CustomObjectXmlBuilder } from '../../test-helpers/test-data-builders/custom-object-xml-builder';

describe('Generates Custom Object documentation', () => {
  beforeAll(() => {
    extendExpect();
  });

  describe('documentation content', () => {
    it('displays the object label as a heading', async () => {
      const input = unparsedObjectBundleFromRawString({
        rawContent: new CustomObjectXmlBuilder().build(),
        filePath: 'src/object/TestObject__c.object-meta.xml',
      });

      const result = await generateDocs([input])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('# MyTestObject'));
    });

    it('displays the object description', async () => {
      const input = unparsedObjectBundleFromRawString({
        rawContent: new CustomObjectXmlBuilder().build(),
        filePath: 'src/object/TestObject__c.object-meta.xml',
      });

      const result = await generateDocs([input])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('test object for testing'));
    });

    it('displays the object api name', async () => {
      const input = unparsedObjectBundleFromRawString({
        rawContent: new CustomObjectXmlBuilder().build(),
        filePath: 'src/object/TestObject__c.object-meta.xml',
      });

      const result = await generateDocs([input])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('`TestObject__c`'));
    });

    it('displays the Fields heading if fields are present', async () => {
      const customObjectBundle = unparsedObjectBundleFromRawString({
        rawContent: new CustomObjectXmlBuilder().build(),
        filePath: 'src/object/TestObject__c.object-meta.xml',
      });

      const customFieldBundle = unparsedFieldBundleFromRawString({
        filePath: 'src/object/TestField__c.field-meta.xml',
        parentName: 'TestObject__c',
      });

      const result = await generateDocs([customObjectBundle, customFieldBundle])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## Fields'));
    });

    it('displays the pick list values name', async () => {
      const customObjectBundle = unparsedObjectBundleFromRawString({
        rawContent: new CustomObjectXmlBuilder().build(),
        filePath: 'src/object/TestObject__c.object-meta.xml',
      });

      const customFieldBundle = unparsedFieldBundleFromRawString({
        rawContent: customFieldPickListValues,
        filePath: 'src/object/TestField__c.field-meta.xml',
        parentName: 'TestObject__c',
      });

      const result = await generateDocs([customObjectBundle, customFieldBundle])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('* Staging'));
      assertEither(result, (data) => expect(data).firstDocContains('* Active'));
      assertEither(result, (data) => expect(data).firstDocContains('* Inactive'));
    });

    it('does not display the Fields heading if no fields are present', async () => {
      const input = unparsedObjectBundleFromRawString({
        rawContent: new CustomObjectXmlBuilder().build(),
        filePath: 'src/object/TestObject__c.object-meta.xml',
      });

      const result = await generateDocs([input])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).not.firstDocContains('## Fields'));
    });

    it('displays the field label as a heading', async () => {
      const customObjectBundle = unparsedObjectBundleFromRawString({
        rawContent: new CustomObjectXmlBuilder().build(),
        filePath: 'src/object/TestObject__c.object-meta.xml',
      });

      const customFieldBundle = unparsedFieldBundleFromRawString({
        filePath: 'src/object/TestField__c.field-meta.xml',
        parentName: 'TestObject__c',
      });

      const result = await generateDocs([customObjectBundle, customFieldBundle])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('## PhotoUrl'));
    });

    it('displays the field description', async () => {
      const customObjectBundle = unparsedObjectBundleFromRawString({
        rawContent: new CustomObjectXmlBuilder().build(),
        filePath: 'src/object/TestObject__c.object-meta.xml',
      });

      const customFieldBundle = unparsedFieldBundleFromRawString({
        filePath: 'src/object/TestField__c.field-meta.xml',
        parentName: 'TestObject__c',
      });

      const result = await generateDocs([customObjectBundle, customFieldBundle])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('A URL that points to a photo'));
    });

    it('displays the field api name', async () => {
      const customObjectBundle = unparsedObjectBundleFromRawString({
        rawContent: new CustomObjectXmlBuilder().build(),
        filePath: 'src/object/TestObject__c.object-meta.xml',
      });

      const customFieldBundle = unparsedFieldBundleFromRawString({
        filePath: 'src/object/TestField__c.field-meta.xml',
        parentName: 'TestObject__c',
      });

      const result = await generateDocs([customObjectBundle, customFieldBundle])();
      expect(result).documentationBundleHasLength(1);
      assertEither(result, (data) => expect(data).firstDocContains('`TestField__c`'));
    });
  });
});
