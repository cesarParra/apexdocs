import { ClassMirror, EnumMirror, MethodMirror, Type } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';
import { areMethodsEqual } from './method-changes-checker';

export type VersionManifest = {
  types: Type[];
};

type NewEnumValue = {
  __typename: 'NewEnumValue';
  value: string;
};

type RemovedEnumValue = {
  __typename: 'RemovedEnumValue';
  value: string;
};

type NewMethod = {
  __typename: 'NewMethod';
  name: string;
};

type RemovedMethod = {
  __typename: 'RemovedMethod';
  name: string;
};

type NewProperty = {
  __typename: 'NewProperty';
  name: string;
};

type RemovedProperty = {
  __typename: 'RemovedProperty';
  name: string;
};

type NewField = {
  __typename: 'NewField';
  name: string;
};

type RemovedField = {
  __typename: 'RemovedField';
  name: string;
};

type NewType = {
  __typename: 'NewType';
  name: string;
};

type RemovedType = {
  __typename: 'RemovedType';
  name: string;
};

type MemberModificationType =
  | NewEnumValue
  | RemovedEnumValue
  | NewMethod
  | RemovedMethod
  | NewProperty
  | RemovedProperty
  | NewField
  | RemovedField
  | NewType
  | RemovedType;

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
          modifications: [...getNewEnumValues(oldEnum, newEnum), ...getRemovedEnumValues(oldEnum, newEnum)],
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
            ...getNewMethods(oldMethodAware, newMethodAware),
            ...getRemovedMethods(oldMethodAware, newMethodAware),
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
            ...getNewProperties(oldClass, newClass),
            ...getRemovedProperties(oldClass, newClass),
            ...getNewFields(oldClass, newClass),
            ...getRemovedFields(oldClass, newClass),
            ...getNewInnerClasses(oldClass, newClass),
            ...getRemovedInnerClasses(oldClass, newClass),
            ...getNewInnerInterfaces(oldClass, newClass),
            ...getRemovedInnerInterfaces(oldClass, newClass),
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

function getNewEnumValues(oldEnum: EnumMirror, newEnum: EnumMirror): NewEnumValue[] {
  return newEnum.values
    .filter(
      (newValue) => !oldEnum.values.some((oldValue) => oldValue.name.toLowerCase() === newValue.name.toLowerCase()),
    )
    .map((value) => ({ __typename: 'NewEnumValue', value: value.name }));
}

function getRemovedEnumValues(oldEnum: EnumMirror, newEnum: EnumMirror): RemovedEnumValue[] {
  return oldEnum.values
    .filter(
      (oldValue) => !newEnum.values.some((newValue) => newValue.name.toLowerCase() === oldValue.name.toLowerCase()),
    )
    .map((value) => ({ __typename: 'RemovedEnumValue', value: value.name }));
}

type MethodAware = {
  methods: MethodMirror[];
};

function getNewMethods(oldMethodAware: MethodAware, newMethodAware: MethodAware): NewMethod[] {
  return newMethodAware.methods
    .filter((newMethod) => !oldMethodAware.methods.some((oldMethod) => areMethodsEqual(oldMethod, newMethod)))
    .map((method) => ({ __typename: 'NewMethod', name: method.name }));
}

function getRemovedMethods(oldMethodAware: MethodAware, newMethodAware: MethodAware): RemovedMethod[] {
  return oldMethodAware.methods
    .filter((oldMethod) => !newMethodAware.methods.some((newMethod) => areMethodsEqual(oldMethod, newMethod)))
    .map((method) => ({ __typename: 'RemovedMethod', name: method.name }));
}

function getNewProperties(oldClass: ClassMirror, newClass: ClassMirror): NewProperty[] {
  return newClass.properties
    .filter(
      (newValue) =>
        !oldClass.properties.some((oldValue) => oldValue.name.toLowerCase() === newValue.name.toLowerCase()),
    )
    .map((value) => ({ __typename: 'NewProperty', name: value.name }));
}

function getRemovedProperties(oldClass: ClassMirror, newClass: ClassMirror): RemovedProperty[] {
  return oldClass.properties
    .filter(
      (oldValue) =>
        !newClass.properties.some((newValue) => newValue.name.toLowerCase() === oldValue.name.toLowerCase()),
    )
    .map((value) => ({ __typename: 'RemovedProperty', name: value.name }));
}

function getNewFields(oldClass: ClassMirror, newClass: ClassMirror): NewField[] {
  return newClass.fields
    .filter(
      (newValue) => !oldClass.fields.some((oldValue) => oldValue.name.toLowerCase() === newValue.name.toLowerCase()),
    )
    .map((value) => ({ __typename: 'NewField', name: value.name }));
}

function getRemovedFields(oldClass: ClassMirror, newClass: ClassMirror): RemovedField[] {
  return oldClass.fields
    .filter(
      (oldValue) => !newClass.fields.some((newValue) => newValue.name.toLowerCase() === oldValue.name.toLowerCase()),
    )
    .map((value) => ({ __typename: 'RemovedField', name: value.name }));
}

function getNewInnerClasses(oldClass: ClassMirror, newClass: ClassMirror): NewType[] {
  return newClass.classes
    .filter(
      (newValue) => !oldClass.classes.some((oldValue) => oldValue.name.toLowerCase() === newValue.name.toLowerCase()),
    )
    .map((value) => ({ __typename: 'NewType', name: value.name }));
}

function getRemovedInnerClasses(oldClass: ClassMirror, newClass: ClassMirror): RemovedType[] {
  return oldClass.classes
    .filter(
      (oldValue) => !newClass.classes.some((newValue) => newValue.name.toLowerCase() === oldValue.name.toLowerCase()),
    )
    .map((value) => ({ __typename: 'RemovedType', name: value.name }));
}

function getNewInnerInterfaces(oldClass: ClassMirror, newClass: ClassMirror): NewType[] {
  return newClass.interfaces
    .filter(
      (newValue) =>
        !oldClass.interfaces.some((oldValue) => oldValue.name.toLowerCase() === newValue.name.toLowerCase()),
    )
    .map((value) => ({ __typename: 'NewType', name: value.name }));
}

function getRemovedInnerInterfaces(oldClass: ClassMirror, newClass: ClassMirror): RemovedType[] {
  return oldClass.interfaces
    .filter(
      (oldValue) =>
        !newClass.interfaces.some((newValue) => newValue.name.toLowerCase() === oldValue.name.toLowerCase()),
    )
    .map((value) => ({ __typename: 'RemovedType', name: value.name }));
}
