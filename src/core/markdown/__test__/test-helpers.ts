import {
  UnparsedApexBundle,
  UnparsedCustomObjectBundle,
  UnparsedSourceBundle,
  UnparsedTriggerBundle,
} from '../../shared/types';
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

export function unparsedTriggerBundleFromRawString(meta: {
  rawContent: string;
  filePath: string;
  name?: string;
}): UnparsedTriggerBundle {
  return {
    type: 'trigger',
    name: meta.name ?? 'TestTrigger',
    filePath: meta.filePath,
    content: meta.rawContent,
  };
}

export function unparsedObjectBundleFromRawString(meta: {
  rawContent: string;
  filePath: string;
  name?: string;
}): UnparsedCustomObjectBundle {
  return {
    type: 'customobject',
    name: meta.name ?? 'TestObject__c',
    filePath: meta.filePath,
    content: meta.rawContent,
  };
}

export function generateDocs(bundles: UnparsedSourceBundle[], config?: Partial<MarkdownGeneratorConfig>) {
  return gen(bundles, {
    targetDir: 'target',
    scope: ['global', 'public'],
    customObjectVisibility: ['public'],
    defaultGroupName: 'Miscellaneous',
    customObjectsGroupName: 'Custom Objects',
    triggersGroupName: 'Triggers',
    sortAlphabetically: false,
    referenceGuideTemplate: referenceGuideTemplate,
    linkingStrategy: 'relative',
    excludeTags: [],
    referenceGuideTitle: 'Apex Reference Guide',
    includeFieldSecurityMetadata: true,
    includeInlineHelpTextMetadata: true,
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
