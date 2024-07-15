import { ClassMirror, Type } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';

export function createInheritanceChain(repository: Type[], classMirror: ClassMirror): string[] {
  return pipe(
    O.fromNullable(classMirror.extended_class),
    O.map((extendedClass) => repository.find((type) => type.name.toLowerCase() === extendedClass.toLowerCase())),
    O.flatMap((type) => O.fromNullable(type as ClassMirror)),
    O.match(
      () => (classMirror.extended_class ? [classMirror.extended_class] : []),
      (extendedClass) => [classMirror.extended_class!, ...createInheritanceChain(repository, extendedClass)],
    ),
  );
}

// TODO: We want the inner classes to also have inheritance chain support
