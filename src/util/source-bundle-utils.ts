import {
  UnparsedApexBundle,
  UnparsedCustomFieldBundle,
  UnparsedCustomObjectBundle,
  UnparsedSourceBundle,
} from '../core/shared/types';

export function filterApexSourceFiles(sourceFiles: UnparsedSourceBundle[]): UnparsedApexBundle[] {
  return sourceFiles.filter((sourceFile): sourceFile is UnparsedApexBundle => sourceFile.type === 'apex');
}

export function filterCustomObjectsAndFields(
  sourceFiles: UnparsedSourceBundle[],
): (UnparsedCustomObjectBundle | UnparsedCustomFieldBundle)[] {
  return sourceFiles.filter(
    (sourceFile): sourceFile is UnparsedCustomObjectBundle =>
      sourceFile.type === 'customobject' || sourceFile.type === 'customfield',
  );
}
