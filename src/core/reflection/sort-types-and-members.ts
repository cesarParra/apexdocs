import { ClassMirror, EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { ParsedFile, TopLevelType } from '../shared/types';
import { isApexType, isObjectType } from '../shared/utils';
import { CustomObjectMetadata } from './sobject/reflect-custom-object-sources';

type Named = { name: string };

export function sortTypesAndMembers(
  shouldSort: boolean,
  parsedFiles: ParsedFile<TopLevelType>[],
): ParsedFile<TopLevelType>[] {
  return parsedFiles
    .map((parsedFile) => {
      if (isApexType(parsedFile.type)) {
        return {
          ...parsedFile,
          type: sortTypeMember(parsedFile.type, shouldSort),
        };
      }
      if (isObjectType(parsedFile.type)) {
        return {
          ...parsedFile,
          type: sortCustomObjectFields(parsedFile.type, shouldSort),
        };
      }
      // For TriggerMetadata or any other types, return the original parsedFile unchanged
      return parsedFile;
    })
    .sort((a, b) => sortByNames(shouldSort, a.type, b.type));
}

function sortByNames<T extends Named>(shouldSort: boolean, a: T, b: T): number {
  if (shouldSort) {
    return a.name.localeCompare(b.name);
  }
  return 0;
}

function sortNamed<T extends Named>(shouldSort: boolean, items: T[]): T[] {
  return items.sort((a, b) => sortByNames(shouldSort, a, b));
}

function sortTypeMember(type: Type, shouldSort: boolean): Type {
  switch (type.type_name) {
    case 'enum':
      return sortEnumValues(shouldSort, type as EnumMirror);
    case 'interface':
      return sortInterfaceMethods(shouldSort, type as InterfaceMirror);
    case 'class':
      return sortClassMembers(shouldSort, type as ClassMirror);
  }
}

function sortCustomObjectFields(type: CustomObjectMetadata, shouldSort: boolean): CustomObjectMetadata {
  return {
    ...type,
    fields: sortNamed(shouldSort, type.fields),
  };
}

function sortEnumValues(shouldSort: boolean, enumType: EnumMirror): EnumMirror {
  return {
    ...enumType,
    values: sortNamed(shouldSort, enumType.values),
  };
}

function sortInterfaceMethods(shouldSort: boolean, interfaceType: InterfaceMirror): InterfaceMirror {
  return {
    ...interfaceType,
    methods: sortNamed(shouldSort, interfaceType.methods),
  };
}

function sortClassMembers(shouldSort: boolean, classType: ClassMirror): ClassMirror {
  return {
    ...classType,
    fields: sortNamed(shouldSort, classType.fields),
    classes: sortNamed(shouldSort, classType.classes),
    enums: sortNamed(shouldSort, classType.enums),
    interfaces: sortNamed(shouldSort, classType.interfaces),
    methods: sortNamed(shouldSort, classType.methods),
    properties: sortNamed(shouldSort, classType.properties),
  };
}
