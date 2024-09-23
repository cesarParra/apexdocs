import { ClassMirror, EnumMirror, MethodMirror, Type } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';
import { areMethodsEqual } from './method-changes-checker';

export type VersionManifest = {
  types: Type[];
};

type ModificationTypes =
  | 'NewEnumValue'
  | 'RemovedEnumValue'
  | 'NewMethod'
  | 'RemovedMethod'
  | 'NewProperty'
  | 'RemovedProperty'
  | 'NewField'
  | 'RemovedField'
  | 'NewType'
  | 'RemovedType';

type MemberModificationType = {
  __typename: ModificationTypes;
  name: string;
};

type NewOrModifiedMember = {
  typeName: string;
  modifications: MemberModificationType[];
};

export type ChangeLog = {
  newTypes: string[];
  removedTypes: string[];
  newOrModifiedMembers: NewOrModifiedMember[];
};

export function processChangeLog(oldVersion: VersionManifest, newVersion: VersionManifest): ChangeLog {
  return {
    newTypes: getNewTypes(oldVersion, newVersion),
    removedTypes: getRemovedTypes(oldVersion, newVersion),
    newOrModifiedMembers: getNewOrModifiedMembers(oldVersion, newVersion),
  };
}

function getNewTypes(oldVersion: VersionManifest, newVersion: VersionManifest): string[] {
  return newVersion.types
    .filter((newType) => !oldVersion.types.some((oldType) => oldType.name.toLowerCase() === newType.name.toLowerCase()))
    .map((type) => type.name);
}

function getRemovedTypes(oldVersion: VersionManifest, newVersion: VersionManifest): string[] {
  return oldVersion.types
    .filter((oldType) => !newVersion.types.some((newType) => newType.name.toLowerCase() === oldType.name.toLowerCase()))
    .map((type) => type.name);
}

function getNewOrModifiedMembers(oldVersion: VersionManifest, newVersion: VersionManifest): NewOrModifiedMember[] {
  return pipe(
    getTypesInBothVersions(oldVersion, newVersion),
    (typesInBoth) => [
      ...getNewOrModifiedEnumValues(typesInBoth),
      ...getNewOrModifiedMethods(typesInBoth),
      ...getNewOrModifiedClassMembers(typesInBoth),
    ],
    (newOrModifiedMembers) => newOrModifiedMembers.filter((member) => member.modifications.length > 0),
  );
}

function getNewOrModifiedEnumValues(typesInBoth: TypeInBoth[]): NewOrModifiedMember[] {
  return pipe(
    typesInBoth.filter((typeInBoth) => typeInBoth.oldType.type_name === 'enum'),
    (enumsInBoth) =>
      enumsInBoth.map(({ oldType, newType }) => {
        const oldEnum = oldType as EnumMirror;
        const newEnum = newType as EnumMirror;
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

function getNewOrModifiedMethods(typesInBoth: TypeInBoth[]): NewOrModifiedMember[] {
  return pipe(
    typesInBoth.filter(
      (typeInBoth) => typeInBoth.oldType.type_name === 'class' || typeInBoth.oldType.type_name === 'interface',
    ),
    (typesInBoth) =>
      typesInBoth.map(({ oldType, newType }) => {
        const oldMethodAware = oldType as MethodAware;
        const newMethodAware = newType as MethodAware;

        return {
          typeName: newType.name,
          modifications: [
            ...getNewValues<MethodMirror, MethodAware, 'methods'>(
              oldMethodAware,
              newMethodAware,
              'methods',
              'NewMethod',
              areMethodsEqual,
            ),
            ...getRemovedValues<MethodMirror, MethodAware, 'methods'>(
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

function getNewOrModifiedClassMembers(typesInBoth: TypeInBoth[]): NewOrModifiedMember[] {
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

type TypeInBoth = {
  oldType: Type;
  newType: Type;
};

function getTypesInBothVersions(oldVersion: VersionManifest, newVersion: VersionManifest): TypeInBoth[] {
  return oldVersion.types
    .map((oldType) => ({
      oldType,
      newType: newVersion.types.find((newType) => newType.name.toLowerCase() === oldType.name.toLowerCase()),
    }))
    .filter((type) => type.newType !== undefined) as TypeInBoth[];
}

type NameAware = {
  name: string;
};

type AreEqualFn<T> = (oldValue: T, newValue: T) => boolean;
function areEqualByName<T extends NameAware>(oldValue: T, newValue: T): boolean {
  return oldValue.name.toLowerCase() === newValue.name.toLowerCase();
}

function getNewValues<Named extends NameAware, T extends Record<K, Named[]>, K extends keyof T>(
  oldPlaceToSearch: T,
  newPlaceToSearch: T,
  keyToSearch: K,
  typeName: ModificationTypes,
  areEqualFn: AreEqualFn<Named> = areEqualByName,
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

type MethodAware = {
  methods: MethodMirror[];
};
