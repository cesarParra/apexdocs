import { ClassMirror, Type } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';

export function createInheritanceChain(repository: Type[], classMirror: ClassMirror): string[] {
  return pipe(
    O.fromNullable(classMirror.extended_class),
    O.match(
      () => [],
      (extendedClassName) => inheritanceChainFromParentClassName(repository, extendedClassName),
    ),
  );
}

function inheritanceChainFromParentClassName(repository: Type[], className: string): string[] {
  return pipe(
    O.fromNullable(repository.find((type) => type.name.toLowerCase() === className.toLowerCase())),
    O.match(
      () => [className],
      (extendedClass: Type) => [className, ...createInheritanceChain(repository, extendedClass as ClassMirror)],
    ),
  );
}
