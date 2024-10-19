import { UnparsedApexBundle } from '../../shared/types';
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

export function generateDocs(apexBundles: UnparsedApexBundle[], config?: Partial<MarkdownGeneratorConfig>) {
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
