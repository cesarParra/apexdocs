import ApexBundle from '../../model/apex-bundle';

export function apexBundleFromRawString(raw: string): ApexBundle {
  return {
    filePath: 'test.apex',
    rawTypeContent: raw,
    rawMetadataContent: null,
  };
}
