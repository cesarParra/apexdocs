import { UnparsedCustomFieldBundle } from '../shared/types';

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
