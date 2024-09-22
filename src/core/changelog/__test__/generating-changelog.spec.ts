import { generateChangeLog } from '../generate-changelog';
import { reflect, Type } from '@cparra/apex-reflection';

function typeFromRawString(raw: string): Type {
  const result = reflect(raw);
  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.typeMirror!;
}

describe('when generating a change log', () => {
  it('has no new types when both the old and new versions are empty', () => {
    const oldVersion = { types: [] };
    const newVersion = { types: [] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog.newTypes).toEqual([]);
  });

  it('has no removed types when the old and new versions are empty', () => {
    const oldVersion = { types: [] };
    const newVersion = { types: [] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog.removedTypes).toEqual([]);
  });

  it('has no new types when both the old and new versions are the same', () => {
    const anyClassBody = 'public class AnyClass {}';
    const anyClass = typeFromRawString(anyClassBody);
    const oldVersion = { types: [anyClass] };
    const newVersion = { types: [anyClass] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog.newTypes).toEqual([]);
  });

  it('has no removed types when both the old and new versions are the same', () => {
    const anyClassBody = 'public class AnyClass {}';
    const anyClass = typeFromRawString(anyClassBody);
    const oldVersion = { types: [anyClass] };
    const newVersion = { types: [anyClass] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog.removedTypes).toEqual([]);
  });

  it('lists all new types', () => {
    const existingInBoth = 'public class ExistingInBoth {}';
    const existingClass = typeFromRawString(existingInBoth);
    const oldVersion = { types: [existingClass] };
    const newClassBody = 'public class NewClass {}';
    const newClass = typeFromRawString(newClassBody);
    const newVersion = { types: [existingClass, newClass] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog.newTypes).toEqual([newClass.name]);
  });

  it('lists all removed types', () => {
    const existingInBoth = 'public class ExistingInBoth {}';
    const existingClass = typeFromRawString(existingInBoth);
    const existingOnlyInOld = 'public class ExistingOnlyInOld {}';
    const existingOnlyInOldClass = typeFromRawString(existingOnlyInOld);
    const oldVersion = { types: [existingClass, existingOnlyInOldClass] };
    const newVersion = { types: [existingClass] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog.removedTypes).toEqual([existingOnlyInOldClass.name]);
  });

  it('lists all new values of a modified enum', () => {
    const enumBefore = 'public enum MyEnum { VALUE1 }';
    const oldEnum = typeFromRawString(enumBefore);
    const enumAfter = 'public enum MyEnum { VALUE1, VALUE2 }';
    const newEnum = typeFromRawString(enumAfter);

    const oldVersion = { types: [oldEnum] };
    const newVersion = { types: [newEnum] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog.newOrModifiedMembers).toEqual([
      {
        typeName: 'MyEnum',
        modifications: [
          {
            __typename: 'NewEnumValue',
            value: 'VALUE2',
          },
        ],
      },
    ]);
  });

  it('list all removed values of a modified enum', () => {
    const enumBefore = 'public enum MyEnum { VALUE1, VALUE2 }';
    const oldEnum = typeFromRawString(enumBefore);
    const enumAfter = 'public enum MyEnum { VALUE1 }';
    const newEnum = typeFromRawString(enumAfter);

    const oldVersion = { types: [oldEnum] };
    const newVersion = { types: [newEnum] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog.newOrModifiedMembers).toEqual([
      {
        typeName: 'MyEnum',
        modifications: [
          {
            __typename: 'RemovedEnumValue',
            value: 'VALUE2',
          },
        ],
      },
    ]);
  });

  it('lists all new methods of an interface', () => {
    const interfaceBefore = 'public interface MyInterface {}';
    const oldInterface = typeFromRawString(interfaceBefore);
    const interfaceAfter = 'public interface MyInterface { void newMethod(); }';
    const newInterface = typeFromRawString(interfaceAfter);

    const oldVersion = { types: [oldInterface] };
    const newVersion = { types: [newInterface] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog.newOrModifiedMembers).toEqual([
      {
        typeName: 'MyInterface',
        modifications: [
          {
            __typename: 'NewMethod',
            name: 'newMethod',
          },
        ],
      },
    ]);
  });

  it('lists all new methods of a class', () => {
    const classBefore = 'public class MyClass { }';
    const oldClass = typeFromRawString(classBefore);
    const classAfter = 'public class MyClass { void newMethod() {} }';
    const newClass = typeFromRawString(classAfter);

    const oldVersion = { types: [oldClass] };
    const newVersion = { types: [newClass] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog.newOrModifiedMembers).toEqual([
      {
        typeName: 'MyClass',
        modifications: [
          {
            __typename: 'NewMethod',
            name: 'newMethod',
          },
        ],
      },
    ]);
  });

  it('lists all removed methods of an interface', () => {
    const interfaceBefore = 'public interface MyInterface { void oldMethod(); }';
    const oldInterface = typeFromRawString(interfaceBefore);
    const interfaceAfter = 'public interface MyInterface {}';
    const newInterface = typeFromRawString(interfaceAfter);

    const oldVersion = { types: [oldInterface] };
    const newVersion = { types: [newInterface] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog.newOrModifiedMembers).toEqual([
      {
        typeName: 'MyInterface',
        modifications: [
          {
            __typename: 'RemovedMethod',
            name: 'oldMethod',
          },
        ],
      },
    ]);
  });

  it('lists all new properties of a class', () => {
    const classBefore = 'public class MyClass { }';
    const oldClass = typeFromRawString(classBefore);
    const classAfter = 'public class MyClass { String newProperty { get; set; } }';
    const newClass = typeFromRawString(classAfter);

    const oldVersion = { types: [oldClass] };
    const newVersion = { types: [newClass] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog.newOrModifiedMembers).toEqual([
      {
        typeName: 'MyClass',
        modifications: [
          {
            __typename: 'NewProperty',
            name: 'newProperty',
          },
        ],
      },
    ]);
  });

  it('lists all removed properties of a class', () => {
    const classBefore = 'public class MyClass { String oldProperty { get; set; } }';
    const oldClass = typeFromRawString(classBefore);
    const classAfter = 'public class MyClass { }';
    const newClass = typeFromRawString(classAfter);

    const oldVersion = { types: [oldClass] };
    const newVersion = { types: [newClass] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog.newOrModifiedMembers).toEqual([
      {
        typeName: 'MyClass',
        modifications: [
          {
            __typename: 'RemovedProperty',
            name: 'oldProperty',
          },
        ],
      },
    ]);
  });

  it('lists all new fields of a class', () => {
    const classBefore = 'public class MyClass { }';
    const oldClass = typeFromRawString(classBefore);
    const classAfter = 'public class MyClass { String newField; }';
    const newClass = typeFromRawString(classAfter);

    const oldVersion = { types: [oldClass] };
    const newVersion = { types: [newClass] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog.newOrModifiedMembers).toEqual([
      {
        typeName: 'MyClass',
        modifications: [
          {
            __typename: 'NewField',
            name: 'newField',
          },
        ],
      },
    ]);
  });

  it('lists all removed fields of a class', () => {
    const classBefore = 'public class MyClass { String oldField; }';
    const oldClass = typeFromRawString(classBefore);
    const classAfter = 'public class MyClass { }';
    const newClass = typeFromRawString(classAfter);

    const oldVersion = { types: [oldClass] };
    const newVersion = { types: [newClass] };

    const changeLog = generateChangeLog(oldVersion, newVersion);

    expect(changeLog.newOrModifiedMembers).toEqual([
      {
        typeName: 'MyClass',
        modifications: [
          {
            __typename: 'RemovedField',
            name: 'oldField',
          },
        ],
      },
    ]);
  });
});
