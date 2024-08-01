import { SourceFile } from '../../core/shared/types';

export function apexBundleFromRawString(raw: string, rawMetadata?: string): SourceFile {
  return {
    filePath: 'test.cls',
    content: raw,
    metadataContent: rawMetadata ?? null,
  };
}
