import {
  UnparsedApexBundle,
  UnparsedCustomFieldBundle, UnparsedCustomMetadataBundle,
  UnparsedCustomObjectBundle,
  UnparsedSourceBundle,
} from '../core/shared/types';

export function filterApexSourceFiles(sourceFiles: UnparsedSourceBundle[]): UnparsedApexBundle[] {
  return sourceFiles.filter((sourceFile): sourceFile is UnparsedApexBundle => sourceFile.type === 'apex');
}

// TODO: The changelog still uses this
export function filterCustomObjectsAndFields(
  sourceFiles: UnparsedSourceBundle[],
): (UnparsedCustomObjectBundle | UnparsedCustomFieldBundle)[] {
  return sourceFiles.filter(
    (sourceFile): sourceFile is UnparsedCustomObjectBundle =>
      sourceFile.type === 'customobject' || sourceFile.type === 'customfield',
  );
}

export function filterCustomObjectsFieldsAndMetadataRecords(
  sourceFiles: UnparsedSourceBundle[],
): (UnparsedCustomObjectBundle | UnparsedCustomFieldBundle | UnparsedCustomMetadataBundle)[] {
  return sourceFiles.filter(
    (sourceFile): sourceFile is UnparsedCustomObjectBundle =>
      sourceFile.type === 'customobject' || sourceFile.type === 'customfield' || sourceFile.type === 'custommetadata',
  );
}
