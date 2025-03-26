import { ClassMirror, EnumMirror, InterfaceMirror, MethodMirror, Type } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';
import { areMethodsEqual } from './method-changes-checker';
import { CustomObjectMetadata } from '../reflection/sobject/reflect-custom-object-sources';
import { CustomFieldMetadata } from '../reflection/sobject/reflect-custom-field-source';
import { CustomMetadataMetadata } from '../reflection/sobject/reflect-custom-metadata-source';
import { TriggerMetadata } from '../reflection/trigger/reflect-trigger-source';

export type ParsedType = Type | CustomObjectMetadata | CustomFieldMetadata | CustomMetadataMetadata | TriggerMetadata;

export type VersionManifest = {
  types: ParsedType[];
};

type ModificationTypes =
  | 'NewType'
  | 'RemovedType'
  | 'NewEnumValue'
  | 'RemovedEnumValue'
  | 'NewMethod'
  | 'RemovedMethod'
  | 'NewProperty'
  | 'RemovedProperty'
  | 'NewField'
  | 'RemovedField'
  | 'NewCustomMetadataRecord'
  | 'RemovedCustomMetadataRecord'
  | 'NewTrigger'
  | 'RemovedTrigger';

export type MemberModificationType = {
  __typename: ModificationTypes;
  name: string;
  description?: string | null | undefined;
};

export type NewOrModifiedMember = {
  typeName: string;
  modifications: MemberModificationType[];
};

export type TriggerChange = {
  triggerName: string;
  objectName: string;
};

export type Changelog = {
  newApexTypes: string[];
  removedApexTypes: string[];
  newOrModifiedApexMembers: NewOrModifiedMember[];
  newCustomObjects: string[];
  removedCustomObjects: string[];
  customObjectModifications: NewOrModifiedMember[];
  newTriggers: TriggerChange[];
  removedTriggers: TriggerChange[];
};

export function hasChanges(changelog: Changelog): boolean {
  return (
    changelog.newApexTypes.length > 0 ||
    changelog.removedApexTypes.length > 0 ||
    changelog.newOrModifiedApexMembers.length > 0
  );
}

export function processChangelog(oldVersion: VersionManifest, newVersion: VersionManifest): Changelog {
  return {
    newApexTypes: getNewApexTypes(oldVersion, newVersion),
    removedApexTypes: getRemovedApexTypes(oldVersion, newVersion),
    newOrModifiedApexMembers: getNewOrModifiedApexMembers(oldVersion, newVersion),
    newCustomObjects: getNewCustomObjects(oldVersion, newVersion),
    removedCustomObjects: getRemovedCustomObjects(oldVersion, newVersion),
    customObjectModifications: [
      ...getCustomObjectModifications(oldVersion, newVersion),
      ...getNewOrModifiedExtensionFields(oldVersion, newVersion),
    ],
    newTriggers: getNewTriggers(oldVersion, newVersion),
    removedTriggers: getRemovedTriggers(oldVersion, newVersion),
  };
}

function getNewApexTypes(oldVersion: VersionManifest, newVersion: VersionManifest): string[] {
  return newVersion.types
    .filter((newType): newType is Type => newType.type_name !== 'customobject')
    .filter((newType) => !oldVersion.types.some((oldType) => oldType.name.toLowerCase() === newType.name.toLowerCase()))
    .map((type) => type.name);
}

function getRemovedApexTypes(oldVersion: VersionManifest, newVersion: VersionManifest): string[] {
  return oldVersion.types
    .filter((newType): newType is Type => newType.type_name !== 'customobject')
    .filter((oldType) => !newVersion.types.some((newType) => newType.name.toLowerCase() === oldType.name.toLowerCase()))
    .map((type) => type.name);
}

function getNewTriggers(oldVersion: VersionManifest, newVersion: VersionManifest): TriggerChange[] {
  return newVersion.types
    .filter((newType): newType is TriggerMetadata => newType.type_name === 'trigger')
    .filter(
      (newTrigger) => !oldVersion.types.some((oldType) => oldType.name.toLowerCase() === newTrigger.name.toLowerCase()),
    )
    .map((trigger) => ({ triggerName: trigger.name, objectName: trigger.object_name }));
}

function getRemovedTriggers(oldVersion: VersionManifest, newVersion: VersionManifest): TriggerChange[] {
  return oldVersion.types
    .filter((newType): newType is TriggerMetadata => newType.type_name === 'trigger')
    .filter(
      (oldTrigger) => !newVersion.types.some((newType) => newType.name.toLowerCase() === oldTrigger.name.toLowerCase()),
    )
    .map((trigger) => ({ triggerName: trigger.name, objectName: trigger.object_name }));
}

function getNewCustomObjects(oldVersion: VersionManifest, newVersion: VersionManifest): string[] {
  return newVersion.types
    .filter((newType): newType is CustomObjectMetadata => newType.type_name === 'customobject')
    .filter((newType) => !oldVersion.types.some((oldType) => oldType.name.toLowerCase() === newType.name.toLowerCase()))
    .map((type) => type.name);
}

function getRemovedCustomObjects(oldVersion: VersionManifest, newVersion: VersionManifest): string[] {
  return oldVersion.types
    .filter((newType): newType is CustomObjectMetadata => newType.type_name === 'customobject')
    .filter((oldType) => !newVersion.types.some((newType) => newType.name.toLowerCase() === oldType.name.toLowerCase()))
    .map((type) => type.name);
}

function getNewOrModifiedApexMembers(oldVersion: VersionManifest, newVersion: VersionManifest): NewOrModifiedMember[] {
  return pipe(
    getApexTypesInBothVersions(oldVersion, newVersion),
    (typesInBoth) => [
      ...getNewOrModifiedEnumValues(typesInBoth),
      ...getNewOrModifiedMethods(typesInBoth),
      ...getNewOrModifiedClassMembers(typesInBoth),
    ],
    (newOrModifiedMembers) => newOrModifiedMembers.filter((member) => member.modifications.length > 0),
  );
}

function getCustomObjectModifications(oldVersion: VersionManifest, newVersion: VersionManifest): NewOrModifiedMember[] {
  return pipe(
    getCustomObjectsInBothVersions(oldVersion, newVersion),
    (customObjectsInBoth) => [
      ...getNewOrRemovedCustomFields(customObjectsInBoth),
      ...getNewOrRemovedCustomMetadataRecords(customObjectsInBoth),
    ],
    (customObjectModifications) => customObjectModifications.filter((member) => member.modifications.length > 0),
  );
}

function getNewOrModifiedExtensionFields(
  oldVersion: VersionManifest,
  newVersion: VersionManifest,
): NewOrModifiedMember[] {
  const extensionFieldsInOldVersion = oldVersion.types.filter(
    (type): type is CustomFieldMetadata => type.type_name === 'customfield',
  );
  const extensionFieldsInNewVersion = newVersion.types.filter(
    (type): type is CustomFieldMetadata => type.type_name === 'customfield',
  );

  // An extension field is equal if it has the same name and the same parent name
  function areFieldEquals(oldField: CustomFieldMetadata, newField: CustomFieldMetadata): boolean {
    return (
      oldField.name.toLowerCase() === newField.name.toLowerCase() &&
      oldField.parentName.toLowerCase() === newField.parentName.toLowerCase()
    );
  }

  const fieldsOnlyInNewVersion = extensionFieldsInNewVersion.filter(
    (newField) => !extensionFieldsInOldVersion.some((oldField) => areFieldEquals(oldField, newField)),
  );
  const fieldsOnlyInOldVersion = extensionFieldsInOldVersion.filter(
    (oldField) => !extensionFieldsInNewVersion.some((newField) => areFieldEquals(oldField, newField)),
  );

  const newMemberModifications = fieldsOnlyInNewVersion.reduce((previous, currentField) => {
    const parentName = currentField.parentName;
    const additionsToParent = previous.find((parent) => parent.typeName === parentName)?.modifications ?? [];
    return [
      ...previous.filter((parent) => parent.typeName !== parentName),
      {
        typeName: parentName,
        modifications: [
          ...additionsToParent,
          { __typename: 'NewField', name: currentField.name, description: currentField.description },
        ],
      },
    ] as NewOrModifiedMember[];
  }, [] as NewOrModifiedMember[]);

  return fieldsOnlyInOldVersion.reduce((previous, currentField) => {
    const parentName = currentField.parentName;
    const removalsFromParent = previous.find((parent) => parent.typeName === parentName)?.modifications ?? [];
    return [
      ...previous.filter((parent) => parent.typeName !== parentName),
      {
        typeName: parentName,
        modifications: [...removalsFromParent, { __typename: 'RemovedField', name: currentField.name }],
      },
    ] as NewOrModifiedMember[];
  }, newMemberModifications);
}

function getNewOrRemovedCustomFields(typesInBoth: TypeInBoth<CustomObjectMetadata>[]): NewOrModifiedMember[] {
  return typesInBoth.map(({ oldType, newType }) => {
    const oldCustomObject = oldType;
    const newCustomObject = newType;

    return {
      typeName: newType.name,
      modifications: [
        ...getNewValues(oldCustomObject, newCustomObject, 'fields', 'NewField'),
        ...getRemovedValues(oldCustomObject, newCustomObject, 'fields', 'RemovedField'),
      ],
    };
  });
}

function getNewOrRemovedCustomMetadataRecords(typesInBoth: TypeInBoth<CustomObjectMetadata>[]): NewOrModifiedMember[] {
  return typesInBoth.map(({ oldType, newType }) => {
    const oldCustomObject = oldType;
    const newCustomObject = newType;

    return {
      typeName: newType.name,
      modifications: [
        ...getNewValues(oldCustomObject, newCustomObject, 'metadataRecords', 'NewCustomMetadataRecord'),
        ...getRemovedValues(oldCustomObject, newCustomObject, 'metadataRecords', 'RemovedCustomMetadataRecord'),
      ],
    };
  });
}

function getNewOrModifiedEnumValues(typesInBoth: TypeInBoth<Type>[]): NewOrModifiedMember[] {
  return pipe(
    typesInBoth.filter((typeInBoth): typeInBoth is TypeInBoth<EnumMirror> => typeInBoth.oldType.type_name === 'enum'),
    (enumsInBoth) =>
      enumsInBoth.map(({ oldType, newType }) => {
        const oldEnum = oldType;
        const newEnum = newType;
        return {
          typeName: newType.name,
          modifications: [
            ...getNewValues(oldEnum, newEnum, 'values', 'NewEnumValue'),
            ...getRemovedValues(oldEnum, newEnum, 'values', 'RemovedEnumValue'),
          ],
        };
      }),
  );
}

function getNewOrModifiedMethods(typesInBoth: TypeInBoth<Type>[]): NewOrModifiedMember[] {
  return pipe(
    typesInBoth.filter(
      (typeInBoth): typeInBoth is TypeInBoth<ClassMirror | InterfaceMirror> =>
        typeInBoth.oldType.type_name === 'class' || typeInBoth.oldType.type_name === 'interface',
    ),
    (typesInBoth) =>
      typesInBoth.map(({ oldType, newType }) => {
        const oldMethodAware = oldType;
        const newMethodAware = newType;

        return {
          typeName: newType.name,
          modifications: [
            ...getNewValues<MethodMirror, InterfaceMirror | ClassMirror, 'methods'>(
              oldMethodAware,
              newMethodAware,
              'methods',
              'NewMethod',
              areMethodsEqual,
            ),
            ...getRemovedValues<MethodMirror, InterfaceMirror | ClassMirror, 'methods'>(
              oldMethodAware,
              newMethodAware,
              'methods',
              'RemovedMethod',
              areMethodsEqual,
            ),
          ],
        };
      }),
  );
}

function getNewOrModifiedClassMembers(typesInBoth: TypeInBoth<Type>[]): NewOrModifiedMember[] {
  return pipe(
    typesInBoth.filter((typeInBoth) => typeInBoth.oldType.type_name === 'class'),
    (classesInBoth) =>
      classesInBoth.map(({ oldType, newType }) => {
        const oldClass = oldType as ClassMirror;
        const newClass = newType as ClassMirror;

        return {
          typeName: newType.name,
          modifications: [
            ...getNewValues(oldClass, newClass, 'properties', 'NewProperty'),
            ...getRemovedValues(oldClass, newClass, 'properties', 'RemovedProperty'),
            ...getNewValues(oldClass, newClass, 'fields', 'NewField'),
            ...getRemovedValues(oldClass, newClass, 'fields', 'RemovedField'),
            ...getNewValues(oldClass, newClass, 'classes', 'NewType'),
            ...getRemovedValues(oldClass, newClass, 'classes', 'RemovedType'),
            ...getNewValues(oldClass, newClass, 'interfaces', 'NewType'),
            ...getRemovedValues(oldClass, newClass, 'interfaces', 'RemovedType'),
            ...getNewValues(oldClass, newClass, 'enums', 'NewType'),
            ...getRemovedValues(oldClass, newClass, 'enums', 'RemovedType'),
          ],
        };
      }),
  );
}

type TypeInBoth<T extends Type | CustomObjectMetadata> = {
  oldType: T;
  newType: T;
};

function getApexTypesInBothVersions(oldVersion: VersionManifest, newVersion: VersionManifest): TypeInBoth<Type>[] {
  return oldVersion.types
    .filter((newType): newType is Type => newType.type_name !== 'customobject')
    .map((oldType) => ({
      oldType,
      newType: newVersion.types.find((newType) => newType.name.toLowerCase() === oldType.name.toLowerCase()),
    }))
    .filter((type): type is TypeInBoth<Type> => type.newType !== undefined);
}

function getCustomObjectsInBothVersions(
  oldVersion: VersionManifest,
  newVersion: VersionManifest,
): TypeInBoth<CustomObjectMetadata>[] {
  return oldVersion.types
    .filter((newType): newType is CustomObjectMetadata => newType.type_name === 'customobject')
    .map((oldType) => ({
      oldType,
      newType: newVersion.types.find((newType) => newType.name.toLowerCase() === oldType.name.toLowerCase()),
    }))
    .filter((type): type is TypeInBoth<CustomObjectMetadata> => type.newType !== undefined);
}

type NameAware = {
  name: string;
  description?: string | null;
};

type AreEqualFn<T> = (oldValue: T, newValue: T) => boolean;

function areEqualByName<T extends NameAware>(oldValue: T, newValue: T): boolean {
  return oldValue.name.toLowerCase() === newValue.name.toLowerCase();
}

function getNewValues<Searchable extends NameAware, T extends Record<K, Searchable[]>, K extends keyof T>(
  oldPlaceToSearch: T,
  newPlaceToSearch: T,
  keyToSearch: K,
  typeName: ModificationTypes,
  areEqualFn: AreEqualFn<Searchable> = areEqualByName,
): MemberModificationType[] {
  return newPlaceToSearch[keyToSearch]
    .filter((newValue) => !oldPlaceToSearch[keyToSearch].some((oldValue) => areEqualFn(oldValue, newValue)))
    .map(({ name, description }) => ({ __typename: typeName, name, description }));
}

function getRemovedValues<Named extends NameAware, T extends Record<K, Named[]>, K extends keyof T>(
  oldPlaceToSearch: T,
  newPlaceToSearch: T,
  keyToSearch: K,
  typeName: ModificationTypes,
  areEqualFn: AreEqualFn<Named> = areEqualByName,
): MemberModificationType[] {
  return oldPlaceToSearch[keyToSearch]
    .filter((oldValue) => !newPlaceToSearch[keyToSearch].some((newValue) => areEqualFn(oldValue, newValue)))
    .map((value) => value.name)
    .map((name) => ({ __typename: typeName, name }));
}
