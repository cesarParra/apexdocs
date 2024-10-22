import { ClassMirror, EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { ParsedFile } from '../shared/types';
import { isApexType } from '../shared/utils';
import { CustomObjectMetadata } from './sobject/reflect-custom-object-sources';
import { CustomFieldMetadata } from './sobject/reflect-custom-field-source';

type Named = { name: string };

export function sortTypesAndMembers(
  shouldSort: boolean,
  parsedFiles: ParsedFile<Type | CustomObjectMetadata>[],
): ParsedFile<Type | CustomObjectMetadata>[] {
  return parsedFiles
    .map((parsedFile) => ({
      ...parsedFile,
      type: isApexType(parsedFile.type)
        ? sortTypeMember(parsedFile.type, shouldSort)
        : sortCustomObjectFields(parsedFile.type, shouldSort),
    }))
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
    fields: sortFields(type.fields, shouldSort),
  };
}

function sortFields(fields: ParsedFile<CustomFieldMetadata>[], shouldSort: boolean): ParsedFile<CustomFieldMetadata>[] {
  return fields.sort((a, b) => sortByNames(shouldSort, a.type, b.type));
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
