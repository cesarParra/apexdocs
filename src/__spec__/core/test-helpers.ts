import ApexBundle from '../../core/apex-bundle';

export function apexBundleFromRawString(raw: string, rawMetadata?: string): ApexBundle {
  return {
    filePath: 'test.cls',
    rawTypeContent: raw,
    rawMetadataContent: rawMetadata ?? null,
  };
}
