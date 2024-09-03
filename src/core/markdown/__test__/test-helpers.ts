import { UnparsedSourceFile } from '../../shared/types';
import { generateDocs as gen, MarkdownGeneratorConfig } from '../generate-docs';
import { referenceGuideTemplate } from '../templates/reference-guide';

export function apexBundleFromRawString(raw: string, rawMetadata?: string): UnparsedSourceFile {
  return {
    filePath: 'test.cls',
    content: raw,
    metadataContent: rawMetadata ?? null,
  };
}

export function generateDocs(apexBundles: UnparsedSourceFile[], config?: Partial<MarkdownGeneratorConfig>) {
  return gen(apexBundles, {
    targetDir: 'target',
    scope: ['global', 'public'],
    defaultGroupName: 'Miscellaneous',
    sortMembersAlphabetically: true,
    referenceGuideTemplate: referenceGuideTemplate,
    linkingStrategy: 'relative',
    excludeTags: [],
    ...config,
  });
}
