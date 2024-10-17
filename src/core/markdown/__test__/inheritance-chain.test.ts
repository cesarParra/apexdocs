import { ClassMirrorBuilder } from '../../../test-helpers/ClassMirrorBuilder';
import { createInheritanceChain } from '../../reflection/apex/inheritance-chain';

describe('inheritance chain for classes', () => {
  test('returns an empty list of the class does not extend any other class', () => {
    const classMirror = new ClassMirrorBuilder().build();
    const repository = [classMirror];

    const inheritanceChain = createInheritanceChain(repository, classMirror);

    expect(inheritanceChain).toEqual([]);
  });

  test('returns the name of the extended class if it is not found in the repository', () => {
    const classMirror = new ClassMirrorBuilder().withExtendedClass('ExtendedClass').build();
    const repository = [classMirror];

    const inheritanceChain = createInheritanceChain(repository, classMirror);

    expect(inheritanceChain).toEqual(['ExtendedClass']);
  });

  test('returns the extended class when it is present in the repository', () => {
    const classMirror = new ClassMirrorBuilder().withExtendedClass('ExtendedClass').build();
    const extendedClass = new ClassMirrorBuilder().withName('ExtendedClass').build();
    const repository = [classMirror, extendedClass];

    const inheritanceChain = createInheritanceChain(repository, classMirror);

    expect(inheritanceChain).toEqual(['ExtendedClass']);
  });

  test('returns the full inheritance chain when the extended class is also extended', () => {
    const classMirror = new ClassMirrorBuilder().withExtendedClass('ExtendedClass').build();
    const extendedClass = new ClassMirrorBuilder().withName('ExtendedClass').withExtendedClass('SuperClass').build();
    const superClass = new ClassMirrorBuilder().withName('SuperClass').build();
    const repository = [classMirror, extendedClass, superClass];

    const inheritanceChain = createInheritanceChain(repository, classMirror);

    expect(inheritanceChain).toEqual(['ExtendedClass', 'SuperClass']);
  });

  test('returns the inheritance for a class that extends an inner class', () => {
    const classMirror = new ClassMirrorBuilder().withExtendedClass('OuterClass.InnerClass').build();
    const innerClass = new ClassMirrorBuilder().withName('InnerClass').build();
    const outerClass = new ClassMirrorBuilder().withName('OuterClass').addInnerClass(innerClass).build();
    const repository = [classMirror, outerClass];

    const inheritanceChain = createInheritanceChain(repository, classMirror);

    expect(inheritanceChain).toEqual(['OuterClass.InnerClass']);
  });
});
