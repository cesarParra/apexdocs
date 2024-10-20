import { UnparsedCustomFieldBundle } from '../../../shared/types';
import { reflectCustomFieldSources } from '../reflect-custom-field-source';
import { assertEither } from '../../../test-helpers/assert-either';
import * as E from 'fp-ts/Either';

const customFieldContent = `
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>PhotoUrl__c</fullName>
    <externalId>false</externalId>
    <label>PhotoUrl</label>
    <required>false</required>
    <trackFeedHistory>false</trackFeedHistory>
    <type>Url</type>
    <description>A Photo URL field</description>
</CustomField>`;

describe('when parsing custom field metadata', () => {
  test('the resulting type contains the file path', async () => {
    const unparsed: UnparsedCustomFieldBundle = {
      type: 'customfield',
      name: 'PhotoUrl__c',
      parentName: 'MyFirstObject__c',
      filePath: 'src/field/PhotoUrl__c.field-meta.xml',
      content: customFieldContent,
    };

    const result = await reflectCustomFieldSources([unparsed])();

    assertEither(result, (data) => expect(data[0].source.filePath).toBe('src/field/PhotoUrl__c.field-meta.xml'));
  });

  test('the resulting type contains the correct name', async () => {
    const unparsed: UnparsedCustomFieldBundle = {
      type: 'customfield',
      name: 'PhotoUrl__c',
      parentName: 'MyFirstObject__c',
      filePath: 'src/field/PhotoUrl__c.field-meta.xml',
      content: customFieldContent,
    };

    const result = await reflectCustomFieldSources([unparsed])();

    assertEither(result, (data) => expect(data[0].type.name).toBe('PhotoUrl__c'));
  });

  test('the resulting type contains the correct parent name', async () => {
    const unparsed: UnparsedCustomFieldBundle = {
      type: 'customfield',
      name: 'PhotoUrl__c',
      parentName: 'MyFirstObject__c',
      filePath: 'src/field/PhotoUrl__c.field-meta.xml',
      content: customFieldContent,
    };

    const result = await reflectCustomFieldSources([unparsed])();

    assertEither(result, (data) => expect(data[0].type.parentName).toBe('MyFirstObject__c'));
  });

  test('the resulting type contains the correct label', async () => {
    const unparsed: UnparsedCustomFieldBundle = {
      type: 'customfield',
      name: 'PhotoUrl__c',
      parentName: 'MyFirstObject__c',
      filePath: 'src/field/PhotoUrl__c.field-meta.xml',
      content: customFieldContent,
    };

    const result = await reflectCustomFieldSources([unparsed])();

    assertEither(result, (data) => expect(data[0].type.label).toBe('PhotoUrl'));
  });

  test('the resulting type contains the correct type', async () => {
    const unparsed: UnparsedCustomFieldBundle = {
      type: 'customfield',
      name: 'PhotoUrl__c',
      parentName: 'MyFirstObject__c',
      filePath: 'src/field/PhotoUrl__c.field-meta.xml',
      content: customFieldContent,
    };

    const result = await reflectCustomFieldSources([unparsed])();

    assertEither(result, (data) => expect(data[0].type.type).toBe('Url'));
  });

  test('the resulting type contains the correct description', async () => {
    const unparsed: UnparsedCustomFieldBundle = {
      type: 'customfield',
      name: 'PhotoUrl__c',
      parentName: 'MyFirstObject__c',
      filePath: 'src/field/PhotoUrl__c.field-meta.xml',
      content: customFieldContent,
    };

    const result = await reflectCustomFieldSources([unparsed])();

    assertEither(result, (data) => expect(data[0].type.description).toBe('A Photo URL field'));
  });

  test('An error is returned when the XML is in an invalid format', async () => {
    const unparsed: UnparsedCustomFieldBundle = {
      type: 'customfield',
      name: 'PhotoUrl__c',
      parentName: 'MyFirstObject__c',
      filePath: 'src/field/PhotoUrl__c.field-meta.xml',
      content: 'invalid-xml',
    };

    const result = await reflectCustomFieldSources([unparsed])();

    expect(E.isLeft(result)).toBe(true);
  });

  test('An error is returned when the XML is missing the CustomField key', async () => {
    const unparsed: UnparsedCustomFieldBundle = {
      type: 'customfield',
      name: 'PhotoUrl__c',
      parentName: 'MyFirstObject__c',
      filePath: 'src/field/PhotoUrl__c.field-meta.xml',
      content: `
      <?xml version="1.0" encoding="UTF-8"?>
      <SomethingInvalid xmlns="http://soap.sforce.com/2006/04/metadata">
          <fullName>PhotoUrl__c</fullName>
          <externalId>false</externalId>
          <label>PhotoUrl</label>
          <required>false</required>
          <trackFeedHistory>false</trackFeedHistory>
          <type>Url</type>
          <description>A Photo URL field</description>
      </SomethingInvalid>`,
    };

    const result = await reflectCustomFieldSources([unparsed])();

    expect(E.isLeft(result)).toBe(true);
  });

  test('An error is returned when the CustomField key is not an object', async () => {
    const unparsed: UnparsedCustomFieldBundle = {
      type: 'customfield',
      name: 'PhotoUrl__c',
      parentName: 'MyFirstObject__c',
      filePath: 'src/field/PhotoUrl__c.field-meta.xml',
      content: `
      <?xml version="1.0" encoding="UTF-8"?>
      <CustomField xmlns="http://soap.sforce.com/2006/04/metadata">invalid</CustomField>`,
    };

    const result = await reflectCustomFieldSources([unparsed])();

    expect(E.isLeft(result)).toBe(true);
  });

  test('An error is returned when the CustomKey object does not contain the label key', async () => {
    const unparsed: UnparsedCustomFieldBundle = {
      type: 'customfield',
      name: 'PhotoUrl__c',
      parentName: 'MyFirstObject__c',
      filePath: 'src/field/PhotoUrl__c.field-meta.xml',
      content: `
      <?xml version="1.0" encoding="UTF-8"?>
      <CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
          <fullName>PhotoUrl__c</fullName>
          <externalId>false</externalId>
          <required>false</required>
          <trackFeedHistory>false</trackFeedHistory>
          <type>Url</type>
          <description>A Photo URL field</description>
      </CustomField>`,
    };

    const result = await reflectCustomFieldSources([unparsed])();

    expect(E.isLeft(result)).toBe(true);
  });

  test('An error is returned when the CustomKey object does not contain the type key', async () => {
    const unparsed: UnparsedCustomFieldBundle = {
      type: 'customfield',
      name: 'PhotoUrl__c',
      parentName: 'MyFirstObject__c',
      filePath: 'src/field/PhotoUrl__c.field-meta.xml',
      content: `
      <?xml version="1.0" encoding="UTF-8"?>
      <CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
          <fullName>PhotoUrl__c</fullName>
          <externalId>false</externalId>
          <label>PhotoUrl</label>
          <required>false</required>
          <trackFeedHistory>false</trackFeedHistory>
          <description>A Photo URL field</description>
      </CustomField>`,
    };

    const result = await reflectCustomFieldSources([unparsed])();

    expect(E.isLeft(result)).toBe(true);
  });
});
