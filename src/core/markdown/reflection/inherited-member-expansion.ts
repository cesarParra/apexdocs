import { ClassMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { ParsedFile } from '../../shared/types';
import { pipe } from 'fp-ts/function';
import { parsedFilesToTypes } from '../utils';

export const addInheritedMembersToTypes = (parsedFiles: ParsedFile[]) =>
  parsedFiles.map((parsedFile) => addInheritedMembers(parsedFilesToTypes(parsedFiles), parsedFile));

export function addInheritedMembers(repository: Type[], parsedFile: ParsedFile): ParsedFile {
  function addInheritedMembersToType<T extends Type>(repository: Type[], current: T): T {
    if (current.type_name === 'enum') {
      return current;
    } else if (current.type_name === 'interface') {
      return addInheritedInterfaceMethods(current as InterfaceMirror, repository) as T;
    } else {
      return addInheritedClassMembers(current as ClassMirror, repository) as T;
    }
  }

  return {
    ...parsedFile,
    type: addInheritedMembersToType(repository, parsedFile.type),
  };
}

function addInheritedInterfaceMethods(interfaceMirror: InterfaceMirror, repository: Type[]): InterfaceMirror {
  function methodAlreadyExists(memberName: string, members: { name: string }[]) {
    return members.some((member) => member.name.toLowerCase() === memberName.toLowerCase());
  }

  function parentExtractor(interfaceMirror: InterfaceMirror): string[] {
    return interfaceMirror.extended_interfaces;
  }

  const parents = getParents(parentExtractor, interfaceMirror, repository);
  return {
    ...interfaceMirror,
    methods: parents.reduce(
      (acc, currentValue) => [
        ...acc,
        ...currentValue.methods
          .filter((method) => !methodAlreadyExists(method.name, acc))
          .map((method) => ({
            ...method,
            inherited: true,
          })),
      ],
      interfaceMirror.methods,
    ),
  };
}

function addInheritedClassMembers(classMirror: ClassMirror, repository: Type[]): ClassMirror {
  function memberAlreadyExists(memberName: string, members: { name: string }[]) {
    return members.some((member) => member.name.toLowerCase() === memberName.toLowerCase());
  }

  function parentExtractor(classMirror: ClassMirror): string[] {
    return classMirror.extended_class ? [classMirror.extended_class] : [];
  }

  function filterMember<T extends { name: string; access_modifier: string }>(members: T[], existing: T[]): T[] {
    return members
      .filter((member) => member.access_modifier.toLowerCase() !== 'private')
      .filter((member) => !memberAlreadyExists(member.name, existing))
      .map((member) => ({
        ...member,
        inherited: true,
      }));
  }

  const parents = getParents(parentExtractor, classMirror, repository);
  return {
    ...classMirror,
    fields: parents.reduce(
      (acc, currentValue) => [...acc, ...filterMember(currentValue.fields, acc)],
      classMirror.fields,
    ),
    properties: parents.reduce(
      (acc, currentValue) => [...acc, ...filterMember(currentValue.properties, acc)],
      classMirror.properties,
    ),
    methods: parents.reduce(
      (acc, currentValue) => [...acc, ...filterMember(currentValue.methods, acc)],
      classMirror.methods,
    ),
  };
}

function getParents<T extends Type>(
  extendedNamesExtractor: (current: T) => string[],
  current: T,
  repository: Type[],
): T[] {
  return pipe(
    extendedNamesExtractor(current),
    (interfaces: string[]) => interfaces.map((interfaceName) => repository.find((type) => type.name === interfaceName)),
    (interfaces = []) => interfaces.filter((type) => type !== undefined) as T[],
    (interfaces) =>
      interfaces.reduce<T[]>(
        (acc, current) => [...acc, ...getParents(extendedNamesExtractor, current, repository)],
        interfaces,
      ),
  );
}
