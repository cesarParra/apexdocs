import { ApexBundle } from '../../core/shared/types';

export function apexBundleFromRawString(raw: string, rawMetadata?: string): ApexBundle {
  return {
    filePath: 'test.cls',
    rawTypeContent: raw,
    rawMetadataContent: rawMetadata ?? null,
  };
}
