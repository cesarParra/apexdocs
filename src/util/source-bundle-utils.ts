import {
  UnparsedApexBundle,
  UnparsedCustomFieldBundle,
  UnparsedCustomMetadataBundle,
  UnparsedCustomObjectBundle,
  UnparsedSourceBundle,
} from '../core/shared/types';

export function filterApexSourceFiles(sourceFiles: UnparsedSourceBundle[]): UnparsedApexBundle[] {
  return sourceFiles.filter((sourceFile): sourceFile is UnparsedApexBundle => sourceFile.type === 'apex');
}

export function filterCustomObjectsFieldsAndMetadataRecords(
  sourceFiles: UnparsedSourceBundle[],
): (UnparsedCustomObjectBundle | UnparsedCustomFieldBundle | UnparsedCustomMetadataBundle)[] {
  return sourceFiles.filter(
    (sourceFile): sourceFile is UnparsedCustomObjectBundle =>
      sourceFile.type === 'customobject' || sourceFile.type === 'customfield' || sourceFile.type === 'custommetadata',
  );
}
