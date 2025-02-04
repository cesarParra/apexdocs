import { UnparsedCustomFieldBundle, UnparsedCustomMetadataBundle } from '../shared/types';

export const customField = `
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>PhotoUrl__c</fullName>
    <externalId>false</externalId>
    <label>PhotoUrl</label>
    <required>false</required>
    <trackFeedHistory>false</trackFeedHistory>
    <type>Url</type>
    <description>A URL that points to a photo</description>
</CustomField>`;

export function unparsedFieldBundleFromRawString(meta: {
  rawContent?: string;
  filePath: string;
  parentName: string;
}): UnparsedCustomFieldBundle {
  return {
    type: 'customfield',
    name: 'TestField__c',
    filePath: meta.filePath,
    content: meta.rawContent ?? customField,
    parentName: meta.parentName,
  };
}

export const customMetadata = `
<?xml version="1.0" encoding="UTF-8"?>
<CustomMetadata xmlns="http://soap.sforce.com/2006/04/metadata" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <label>Test Metadata</label>
    <protected>true</protected>
    <values>
        <field>Field1__c</field>
        <value xsi:type="xsd:string">Sample Value</value>
    </values>
</CustomMetadata>
`;

export function unparsedCustomMetadataFromRawString(meta: {
  rawContent?: string;
  filePath: string;
  apiName: string;
  parentName: string;
}): UnparsedCustomMetadataBundle {
  return {
    type: 'custommetadata',
    name: meta.apiName,
    filePath: meta.filePath,
    content: meta.rawContent ?? customMetadata,
    apiName: meta.apiName,
    parentName: meta.parentName,
  };
}
