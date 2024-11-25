import { Changelog } from '../process-changelog';
import { FileChange, SourceChangelog } from '../../shared/types';

/**
 * Converts a Changelog to a SourceChangelog, which is a version of a Changelog that is exposed through the hook.
 * We have this conversion to avoid exposing the internal Changelog structure to the hook.
 * @param changelog The Changelog to convert.
 * @returns The SourceChangelog.
 */
export default function (changelog: Changelog): SourceChangelog {
  const newApexTypes = changelog.newApexTypes.map<FileChange>((newType) => {
    return {
      name: newType,
      fileType: 'apex',
      changeType: 'added',
    };
  });

  const removedApexTypes = changelog.removedApexTypes.map<FileChange>((removedType) => {
    return {
      name: removedType,
      fileType: 'apex',
      changeType: 'removed',
    };
  });

  const newCustomObjects = changelog.newCustomObjects.map<FileChange>((newType) => {
    return {
      name: newType,
      fileType: 'customobject',
      changeType: 'added',
    };
  });

  const removedCustomObjects = changelog.removedCustomObjects.map<FileChange>((removedType) => {
    return {
      name: removedType,
      fileType: 'customobject',
      changeType: 'removed',
    };
  });

  const modifiedApexTypes = changelog.newOrModifiedApexMembers.map<FileChange>((modifiedType) => {
    return {
      name: modifiedType.typeName,
      fileType: 'apex',
      changeType: 'changed',
      changes: {
        addedMethods: modifiedType.modifications.filter((mod) => mod.__typename === 'NewMethod').map((mod) => mod.name),
        removedMethods: modifiedType.modifications
          .filter((mod) => mod.__typename === 'RemovedMethod')
          .map((mod) => mod.name),
        addedFields: modifiedType.modifications.filter((mod) => mod.__typename === 'NewField').map((mod) => mod.name),
        removedFields: modifiedType.modifications
          .filter((mod) => mod.__typename === 'RemovedField')
          .map((mod) => mod.name),
        addedProperties: modifiedType.modifications
          .filter((mod) => mod.__typename === 'NewProperty')
          .map((mod) => mod.name),
        removedProperties: modifiedType.modifications
          .filter((mod) => mod.__typename === 'RemovedProperty')
          .map((mod) => mod.name),
        addedSubtypes: modifiedType.modifications.filter((mod) => mod.__typename === 'NewType').map((mod) => mod.name),
        removedSubtypes: modifiedType.modifications
          .filter((mod) => mod.__typename === 'RemovedType')
          .map((mod) => mod.name),
        addedEnumValues: modifiedType.modifications
          .filter((mod) => mod.__typename === 'NewEnumValue')
          .map((mod) => mod.name),
        removedEnumValues: modifiedType.modifications
          .filter((mod) => mod.__typename === 'RemovedEnumValue')
          .map((mod) => mod.name),
      },
    };
  });

  const modifiedCustomObjects = changelog.customObjectModifications.map<FileChange>((modifiedType) => {
    return {
      name: modifiedType.typeName,
      fileType: 'customobject',
      changeType: 'changed',
      changes: {
        addedCustomFields: modifiedType.modifications
          .filter((mod) => mod.__typename === 'NewField')
          .map((mod) => mod.name),
        removedCustomFields: modifiedType.modifications
          .filter((mod) => mod.__typename === 'RemovedField')
          .map((mod) => mod.name),
      },
    };
  });

  return {
    fileChanges: [
      ...newApexTypes,
      ...removedApexTypes,
      ...newCustomObjects,
      ...removedCustomObjects,
      ...modifiedApexTypes,
      ...modifiedCustomObjects,
    ],
  };
}
