import { UnparsedApexFile } from '../../shared/types';
import { generateDocs as gen, MarkdownGeneratorConfig } from '../generate-docs';
import { referenceGuideTemplate } from '../templates/reference-guide';

export function apexBundleFromRawString(raw: string, rawMetadata?: string): UnparsedApexFile {
  return {
    type: 'apex',
    filePath: 'test.cls',
    content: raw,
    metadataContent: rawMetadata ?? null,
  };
}

export function generateDocs(apexBundles: UnparsedApexFile[], config?: Partial<MarkdownGeneratorConfig>) {
  return gen(apexBundles, {
    targetDir: 'target',
    scope: ['global', 'public'],
    defaultGroupName: 'Miscellaneous',
    sortAlphabetically: false,
    referenceGuideTemplate: referenceGuideTemplate,
    linkingStrategy: 'relative',
    excludeTags: [],
    referenceGuideTitle: 'Apex Reference Guide',
    exclude: [],
    ...config,
  });
}
