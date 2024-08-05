import { SourceFile } from '../../shared/types';
import { generateDocs as gen, MarkdownGeneratorConfig } from '../generate-docs';
import { referenceGuideTemplate } from '../templates/reference-guide';

export function apexBundleFromRawString(raw: string, rawMetadata?: string): SourceFile {
  return {
    filePath: 'test.cls',
    content: raw,
    metadataContent: rawMetadata ?? null,
  };
}

export function generateDocs(apexBundles: SourceFile[], config?: Partial<MarkdownGeneratorConfig>) {
  return gen(apexBundles, {
    targetDir: 'target',
    scope: ['global', 'public'],
    defaultGroupName: 'Miscellaneous',
    sortMembersAlphabetically: true,
    referenceGuideTemplate: referenceGuideTemplate,
    ...config,
  });
}
