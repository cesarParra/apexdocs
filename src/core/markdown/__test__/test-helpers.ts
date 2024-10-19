import { UnparsedApexBundle, UnparsedSObjectBundle, UnparsedSourceBundle } from '../../shared/types';
import { generateDocs as gen, MarkdownGeneratorConfig } from '../generate-docs';
import { referenceGuideTemplate } from '../templates/reference-guide';

export function unparsedApexBundleFromRawString(raw: string, rawMetadata?: string): UnparsedApexBundle {
  return {
    type: 'apex',
    filePath: 'test.cls',
    content: raw,
    metadataContent: rawMetadata ?? null,
  };
}

export function unparsedObjectBundleFromRawString(meta: {
  rawContent: string;
  filePath: string;
}): UnparsedSObjectBundle {
  return {
    type: 'sobject',
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

export function customObjectGenerator(
  config: { deploymentStatus: string; visibility: string } = { deploymentStatus: 'Deployed', visibility: 'Public' },
) {
  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
        <deploymentStatus>${config.deploymentStatus}</deploymentStatus>
        <description>test object for testing</description>
        <label>MyTestObject</label>
        <pluralLabel>MyFirstObjects</pluralLabel>
        <visibility>${config.visibility}</visibility>
    </CustomObject>`;
}

