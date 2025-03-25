import {
  UnparsedApexBundle,
  UnparsedCustomFieldBundle,
  UnparsedCustomMetadataBundle,
  UnparsedCustomObjectBundle,
  UnparsedSourceBundle,
  UnparsedTriggerBundle,
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

export function filterTriggerFiles(sourceFiles: UnparsedSourceBundle[]): UnparsedTriggerBundle[] {
  return sourceFiles.filter((sourceFile): sourceFile is UnparsedTriggerBundle => sourceFile.type === 'trigger');
}
