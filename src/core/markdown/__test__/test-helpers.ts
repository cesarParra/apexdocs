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
