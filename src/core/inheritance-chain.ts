import { ClassMirror, Type } from '@cparra/apex-reflection';

// TODO: Make this code functional
export function createInheritanceChain(repository: Type[], classMirror: ClassMirror): string[] {
  if (!classMirror.extended_class) {
    return [];
  }

  const extendedClass = repository.find(
    (type) => type.name.toLowerCase() === classMirror.extended_class?.toLowerCase(),
  );
  if (!extendedClass) {
    return [classMirror.extended_class];
  }

  // recursive call to get the full inheritance chain
  return [classMirror.extended_class, ...createInheritanceChain(repository, extendedClass as ClassMirror)];
}

// TODO: We want the inner classes to also have inheritance chain support
