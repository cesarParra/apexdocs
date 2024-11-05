import { UnparsedApexBundle, UnparsedCustomObjectBundle, UnparsedSourceBundle } from '../../shared/types';
import { generateDocs as gen, MarkdownGeneratorConfig } from '../generate-docs';
import { referenceGuideTemplate } from '../templates/reference-guide';

export function unparsedApexBundleFromRawString(raw: string, rawMetadata?: string): UnparsedApexBundle {
  return {
    type: 'apex',
    name: 'Test',
    filePath: 'test.cls',
    content: raw,
    metadataContent: rawMetadata ?? null,
  };
}

export function unparsedObjectBundleFromRawString(meta: {
  rawContent: string;
  filePath: string;
}): UnparsedCustomObjectBundle {
  return {
    type: 'customobject',
    name: 'TestObject__c',
    filePath: meta.filePath,
    content: meta.rawContent,
  };
}

export function generateDocs(apexBundles: UnparsedSourceBundle[], config?: Partial<MarkdownGeneratorConfig>) {
  return gen(apexBundles, {
    targetDir: 'target',
    scope: ['global', 'public'],
    defaultGroupName: 'Miscellaneous',
    customObjectsGroupName: 'Custom Objects',
    sortAlphabetically: false,
    referenceGuideTemplate: referenceGuideTemplate,
    linkingStrategy: 'relative',
    excludeTags: [],
    referenceGuideTitle: 'Apex Reference Guide',
    exclude: [],
    ...config,
  });
}

export const customFieldPickListValues = `
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
</CustomField>`;
