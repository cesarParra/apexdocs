import { UnparsedCustomFieldBundle } from '../../../shared/types';
import { reflectCustomFieldSources } from '../reflect-custom-field-source';
import { assertEither } from '../../../test-helpers/assert-either';
import * as E from 'fp-ts/Either';
import { isInSource } from '../../../shared/utils';

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

    assertEither(result, (data) => {
      if (isInSource(data[0].source)) {
        expect(data[0].source.filePath).toBe('src/field/PhotoUrl__c.field-meta.xml');
      } else {
        fail('Expected the source to be in the source');
      }
    });
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

  test('can parse picklist values when there are multiple picklist values available', async () => {
    const unparsed: UnparsedCustomFieldBundle = {
      type: 'customfield',
      name: 'Status__c',
      parentName: 'MyFirstObject__c',
      filePath: 'src/field/Status__c.field-meta.xml',
      content: `
      <?xml version="1.0" encoding="UTF-8"?>
      <CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
          <fullName>Status__c</fullName>
          <externalId>false</externalId>
          <label>Status</label>
          <required>true</required>
          <trackFeedHistory>false</trackFeedHistory>
          <description>Status</description>
          <type>Picklist</type>
          <valueSet>
              <restricted>true</restricted>
              <valueSetDefinition>
                  <sorted>false</sorted>
                  <value>
                      <fullName>Staging</fullName>
                      <default>false</default>
                      <label>Staging</label>
                  </value>
                  <value>
                      <fullName>Active</fullName>
                      <default>false</default>
                      <label>Active</label>
                  </value>
                  <value>
                      <fullName>Inactive</fullName>
                      <default>false</default>
                      <label>Inactive</label>
                  </value>
              </valueSetDefinition>
          </valueSet>
      </CustomField>`,
    };

    const result = await reflectCustomFieldSources([unparsed])();

    assertEither(result, (data) => expect(data[0].type.description).toBe('Status'));
    assertEither(result, (data) => expect(data[0].type.pickListValues).toEqual(['Staging', 'Active', 'Inactive']));
  });

  test('can parse picklist values when there is a single value available', async () => {
    const unparsed: UnparsedCustomFieldBundle = {
      type: 'customfield',
      name: 'Status__c',
      parentName: 'MyFirstObject__c',
      filePath: 'src/field/Status__c.field-meta.xml',
      content: `
      <?xml version="1.0" encoding="UTF-8"?>
      <CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
          <fullName>Status__c</fullName>
          <externalId>false</externalId>
          <label>Status</label>
          <required>true</required>
          <trackFeedHistory>false</trackFeedHistory>
          <description>Status</description>
          <type>Picklist</type>
          <valueSet>
              <restricted>true</restricted>
              <valueSetDefinition>
                  <sorted>false</sorted>
                  <value>
                      <fullName>Staging</fullName>
                      <default>false</default>
                      <label>Staging</label>
                  </value>
              </valueSetDefinition>
          </valueSet>
      </CustomField>`,
    };

    const result = await reflectCustomFieldSources([unparsed])();

    assertEither(result, (data) => expect(data[0].type.description).toBe('Status'));
    assertEither(result, (data) => expect(data[0].type.pickListValues).toEqual(['Staging']));
  });

  test('can parse picklist values when there are no values', async () => {
    const unparsed: UnparsedCustomFieldBundle = {
      type: 'customfield',
      name: 'Status__c',
      parentName: 'MyFirstObject__c',
      filePath: 'src/field/Status__c.field-meta.xml',
      content: `
      <?xml version="1.0" encoding="UTF-8"?>
      <CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
          <fullName>Status__c</fullName>
          <externalId>false</externalId>
          <label>Status</label>
          <required>true</required>
          <trackFeedHistory>false</trackFeedHistory>
          <description>Status</description>
          <type>Picklist</type>
          <valueSet>
              <restricted>true</restricted>
              <valueSetDefinition>
                  <sorted>false</sorted>
              </valueSetDefinition>
          </valueSet>
      </CustomField>`,
    };

    const result = await reflectCustomFieldSources([unparsed])();

    assertEither(result, (data) => expect(data[0].type.description).toBe('Status'));
    assertEither(result, (data) => expect(data[0].type.pickListValues).toEqual(undefined));
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
});
