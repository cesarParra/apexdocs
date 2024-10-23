import { ClassMirror, EnumMirror, InterfaceMirror, MethodMirror, Type } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';
import { areMethodsEqual } from './method-changes-checker';
import { CustomObjectMetadata } from '../reflection/sobject/reflect-custom-object-sources';

export type VersionManifest = {
  types: (Type | CustomObjectMetadata)[];
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
  | 'CustomObjectLabelChanged';

export type MemberModificationType = {
  __typename: ModificationTypes;
  name: string;
};

export type NewOrModifiedMember = {
  typeName: string;
  modifications: MemberModificationType[];
};

export type Changelog = {
  newApexTypes: string[];
  removedApexTypes: string[];
  newOrModifiedApexMembers: NewOrModifiedMember[];
  newCustomObjects: string[];
  removedCustomObjects: string[];
  customObjectModifications: NewOrModifiedMember[];
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
    customObjectModifications: getCustomObjectModifications(oldVersion, newVersion),
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
      ...getModifiedCustomObjectLabels(customObjectsInBoth),
      ...getNewOrRemovedCustomFields(customObjectsInBoth),
    ],
    (customObjectModifications) => customObjectModifications.filter((member) => member.modifications.length > 0),
  );
}

function getModifiedCustomObjectLabels(typesInBoth: TypeInBoth<CustomObjectMetadata>[]): NewOrModifiedMember[] {
  return typesInBoth
    .filter(({ oldType, newType }) => oldType.label.toLowerCase() !== newType.label.toLowerCase())
    .map(({ newType }) => ({
      typeName: newType.name,
      modifications: [{ __typename: 'CustomObjectLabelChanged', name: newType.label }],
    }));
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
    .map((value) => value.name)
    .map((name) => ({ __typename: typeName, name }));
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
