import { EnumMirror, Type } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';

export type VersionManifest = {
  types: Type[];
};

type NewEnumValue = {
  __typename: 'NewEnumValue';
  value: string;
};

type MemberModificationType = NewEnumValue;

type NewOrModifiedMember = {
  typeName: string;
  modifications: MemberModificationType[];
};

export type ChangeLog = {
  newTypes: string[];
  removedTypes: string[];
  newOrModifiedMembers: NewOrModifiedMember[];
};

export function generateChangeLog(oldVersion: VersionManifest, newVersion: VersionManifest): ChangeLog {
  return {
    newTypes: getNewTypes(oldVersion, newVersion),
    removedTypes: getRemovedTypes(oldVersion, newVersion),
    newOrModifiedMembers: getNewOrModifiedEnumValues(oldVersion, newVersion),
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

function getNewOrModifiedEnumValues(oldVersion: VersionManifest, newVersion: VersionManifest): NewOrModifiedMember[] {
  return pipe(
    getTypesInBothVersions(oldVersion, newVersion),
    (types) => getEnums(types),
    (enums) =>
      enums.map((enumMirror) => {
        const oldEnum = oldVersion.types.find(
          (type) => type.name.toLowerCase() === enumMirror.name.toLowerCase(),
        ) as EnumMirror;
        const newEnum = newVersion.types.find(
          (type) => type.name.toLowerCase() === enumMirror.name.toLowerCase(),
        ) as EnumMirror;

        return {
          typeName: enumMirror.name,
          modifications: getNewEnumValues(oldEnum, newEnum),
        };
      }),
    (newOrModifiedMembers) => newOrModifiedMembers.filter((member) => member.modifications.length > 0),
  );
}

function getTypesInBothVersions(oldVersion: VersionManifest, newVersion: VersionManifest): Type[] {
  return newVersion.types.filter((newType) =>
    oldVersion.types.some((oldType) => oldType.name.toLowerCase() === newType.name.toLowerCase()),
  );
}

function getEnums(types: Type[]): EnumMirror[] {
  return types.filter((type) => type.type_name === 'enum') as EnumMirror[];
}

function getNewEnumValues(oldEnum: EnumMirror, newEnum: EnumMirror): NewEnumValue[] {
  return newEnum.values
    .filter(
      (newValue) => !oldEnum.values.some((oldValue) => oldValue.name.toLowerCase() === newValue.name.toLowerCase()),
    )
    .map((value) => ({ __typename: 'NewEnumValue', value: value.name }));
}
