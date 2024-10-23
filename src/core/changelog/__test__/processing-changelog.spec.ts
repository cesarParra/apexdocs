import { processChangelog } from '../process-changelog';
import { reflect, Type } from '@cparra/apex-reflection';
import { CustomObjectMetadata } from '../../reflection/sobject/reflect-custom-object-sources';
import { CustomFieldMetadata } from '../../reflection/sobject/reflect-custom-field-source';

function apexTypeFromRawString(raw: string): Type {
  const result = reflect(raw);
  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.typeMirror!;
}

class CustomFieldMetadataBuilder {
  build(): CustomFieldMetadata {
    return {
      type: 'Text',
      type_name: 'customfield',
      label: 'My Field',
      name: 'MyField',
      description: null,
      parentName: 'MyObject',
    };
  }
}

class CustomObjectMetadataBuilder {
  label: string = 'MyObject';
  fields: CustomFieldMetadata[] = [];

  withLabel(label: string): CustomObjectMetadataBuilder {
    this.label = label;
    return this;
  }

  withField(field: CustomFieldMetadata): CustomObjectMetadataBuilder {
    this.fields.push(field);
    return this;
  }

  build(): CustomObjectMetadata {
    return {
      type_name: 'customobject',
      deploymentStatus: 'Deployed',
      visibility: 'Public',
      label: this.label,
      name: 'MyObject',
      description: null,
      fields: this.fields,
    };
  }
}

describe('when generating a changelog', () => {
  it('has no new types when both the old and new versions are empty', () => {
    const oldVersion = { types: [] };
    const newVersion = { types: [] };

    const changeLog = processChangelog(oldVersion, newVersion);

    expect(changeLog.newApexTypes).toEqual([]);
  });

  it('has no removed types when the old and new versions are empty', () => {
    const oldVersion = { types: [] };
    const newVersion = { types: [] };

    const changeLog = processChangelog(oldVersion, newVersion);

    expect(changeLog.removedApexTypes).toEqual([]);
  });

  describe('with apex code', () => {
    it('has no new types when both the old and new versions are the same', () => {
      const anyClassBody = 'public class AnyClass {}';
      const anyClass = apexTypeFromRawString(anyClassBody);
      const oldVersion = { types: [anyClass] };
      const newVersion = { types: [anyClass] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newApexTypes).toEqual([]);
    });

    it('has no removed types when both the old and new versions are the same', () => {
      const anyClassBody = 'public class AnyClass {}';
      const anyClass = apexTypeFromRawString(anyClassBody);
      const oldVersion = { types: [anyClass] };
      const newVersion = { types: [anyClass] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.removedApexTypes).toEqual([]);
    });

    it('lists all new types', () => {
      const existingInBoth = 'public class ExistingInBoth {}';
      const existingClass = apexTypeFromRawString(existingInBoth);
      const oldVersion = { types: [existingClass] };
      const newClassBody = 'public class NewClass {}';
      const newClass = apexTypeFromRawString(newClassBody);
      const newVersion = { types: [existingClass, newClass] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newApexTypes).toEqual([newClass.name]);
    });

    it('lists all removed types', () => {
      const existingInBoth = 'public class ExistingInBoth {}';
      const existingClass = apexTypeFromRawString(existingInBoth);
      const existingOnlyInOld = 'public class ExistingOnlyInOld {}';
      const existingOnlyInOldClass = apexTypeFromRawString(existingOnlyInOld);
      const oldVersion = { types: [existingClass, existingOnlyInOldClass] };
      const newVersion = { types: [existingClass] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.removedApexTypes).toEqual([existingOnlyInOldClass.name]);
    });
  });

  describe('with custom object code', () => {
    it('has no new objects when both the old and new versions are the same', () => {
      const oldVersion = { types: [new CustomObjectMetadataBuilder().build()] };
      const newVersion = { types: [new CustomObjectMetadataBuilder().build()] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newCustomObjects).toEqual([]);
    });

    it('has no removed objects when both the old and new versions are the same', () => {
      const oldVersion = { types: [new CustomObjectMetadataBuilder().build()] };
      const newVersion = { types: [new CustomObjectMetadataBuilder().build()] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.removedCustomObjects).toEqual([]);
    });

    it('lists all new custom objects', () => {
      const oldVersion = { types: [] };
      const newObject = new CustomObjectMetadataBuilder().build();
      const newVersion = { types: [newObject] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newCustomObjects).toEqual([newObject.name]);
    });

    it('lists all removed custom objects', () => {
      const oldObject = new CustomObjectMetadataBuilder().build();
      const oldVersion = { types: [oldObject] };
      const newVersion = { types: [] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.removedCustomObjects).toEqual([oldObject.name]);
    });

    it('lists changed custom object labels', () => {
      const oldObject = new CustomObjectMetadataBuilder().withLabel('OldLabel').build();
      const newObject = new CustomObjectMetadataBuilder().withLabel('NewLabel').build();
      const oldVersion = { types: [oldObject] };
      const newVersion = { types: [newObject] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.customObjectModifications).toEqual([
        {
          typeName: oldObject.name,
          modifications: [
            {
              __typename: 'LabelChanged',
              name: 'NewLabel',
            },
          ],
        },
      ]);
    });

    it('lists all new fields of a custom object', () => {
      const oldObject = new CustomObjectMetadataBuilder().build();
      const newField = new CustomFieldMetadataBuilder().build();
      const newObject = new CustomObjectMetadataBuilder().withField(newField).build();
      const oldVersion = { types: [oldObject] };
      const newVersion = { types: [newObject] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.customObjectModifications).toEqual([
        {
          typeName: newObject.name,
          modifications: [
            {
              __typename: 'NewField',
              name: newField.name,
            },
          ],
        },
      ]);
    });

    it('lists all removed fields of a custom object', () => {
      const oldField = new CustomFieldMetadataBuilder().build();
      const oldObject = new CustomObjectMetadataBuilder().withField(oldField).build();
      const newObject = new CustomObjectMetadataBuilder().build();
      const oldVersion = { types: [oldObject] };
      const newVersion = { types: [newObject] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.customObjectModifications).toEqual([
        {
          typeName: oldObject.name,
          modifications: [
            {
              __typename: 'RemovedField',
              name: oldField.name,
            },
          ],
        },
      ]);
    });
    // [] - Lists changed field labels
  });

  describe('with enum code', () => {
    it('lists all new values of a modified enum', () => {
      const enumBefore = 'public enum MyEnum { VALUE1 }';
      const oldEnum = apexTypeFromRawString(enumBefore);
      const enumAfter = 'public enum MyEnum { VALUE1, VALUE2 }';
      const newEnum = apexTypeFromRawString(enumAfter);

      const oldVersion = { types: [oldEnum] };
      const newVersion = { types: [newEnum] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newOrModifiedApexMembers).toEqual([
        {
          typeName: 'MyEnum',
          modifications: [
            {
              __typename: 'NewEnumValue',
              name: 'VALUE2',
            },
          ],
        },
      ]);
    });

    it('list all removed values of a modified enum', () => {
      const enumBefore = 'public enum MyEnum { VALUE1, VALUE2 }';
      const oldEnum = apexTypeFromRawString(enumBefore);
      const enumAfter = 'public enum MyEnum { VALUE1 }';
      const newEnum = apexTypeFromRawString(enumAfter);

      const oldVersion = { types: [oldEnum] };
      const newVersion = { types: [newEnum] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newOrModifiedApexMembers).toEqual([
        {
          typeName: 'MyEnum',
          modifications: [
            {
              __typename: 'RemovedEnumValue',
              name: 'VALUE2',
            },
          ],
        },
      ]);
    });
  });

  describe('with interface code', () => {
    it('lists all new methods of an interface', () => {
      const interfaceBefore = 'public interface MyInterface {}';
      const oldInterface = apexTypeFromRawString(interfaceBefore);
      const interfaceAfter = 'public interface MyInterface { void newMethod(); }';
      const newInterface = apexTypeFromRawString(interfaceAfter);

      const oldVersion = { types: [oldInterface] };
      const newVersion = { types: [newInterface] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newOrModifiedApexMembers).toEqual([
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

    it('lists all removed methods of an interface', () => {
      const interfaceBefore = 'public interface MyInterface { void oldMethod(); }';
      const oldInterface = apexTypeFromRawString(interfaceBefore);
      const interfaceAfter = 'public interface MyInterface {}';
      const newInterface = apexTypeFromRawString(interfaceAfter);

      const oldVersion = { types: [oldInterface] };
      const newVersion = { types: [newInterface] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newOrModifiedApexMembers).toEqual([
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
  });

  describe('with class code', () => {
    it('lists all new methods of a class', () => {
      const classBefore = 'public class MyClass { }';
      const oldClass = apexTypeFromRawString(classBefore);
      const classAfter = 'public class MyClass { void newMethod() {} }';
      const newClass = apexTypeFromRawString(classAfter);

      const oldVersion = { types: [oldClass] };
      const newVersion = { types: [newClass] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newOrModifiedApexMembers).toEqual([
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

    it('lists all new properties of a class', () => {
      const classBefore = 'public class MyClass { }';
      const oldClass = apexTypeFromRawString(classBefore);
      const classAfter = 'public class MyClass { String newProperty { get; set; } }';
      const newClass = apexTypeFromRawString(classAfter);

      const oldVersion = { types: [oldClass] };
      const newVersion = { types: [newClass] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newOrModifiedApexMembers).toEqual([
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
      const oldClass = apexTypeFromRawString(classBefore);
      const classAfter = 'public class MyClass { }';
      const newClass = apexTypeFromRawString(classAfter);

      const oldVersion = { types: [oldClass] };
      const newVersion = { types: [newClass] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newOrModifiedApexMembers).toEqual([
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
      const oldClass = apexTypeFromRawString(classBefore);
      const classAfter = 'public class MyClass { String newField; }';
      const newClass = apexTypeFromRawString(classAfter);

      const oldVersion = { types: [oldClass] };
      const newVersion = { types: [newClass] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newOrModifiedApexMembers).toEqual([
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
      const oldClass = apexTypeFromRawString(classBefore);
      const classAfter = 'public class MyClass { }';
      const newClass = apexTypeFromRawString(classAfter);

      const oldVersion = { types: [oldClass] };
      const newVersion = { types: [newClass] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newOrModifiedApexMembers).toEqual([
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

    it('lists new inner classes of a class', () => {
      const classBefore = 'public class MyClass { }';
      const oldClass = apexTypeFromRawString(classBefore);
      const classAfter = 'public class MyClass { class NewInnerClass { } }';
      const newClass = apexTypeFromRawString(classAfter);

      const oldVersion = { types: [oldClass] };
      const newVersion = { types: [newClass] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newOrModifiedApexMembers).toEqual([
        {
          typeName: 'MyClass',
          modifications: [
            {
              __typename: 'NewType',
              name: 'NewInnerClass',
            },
          ],
        },
      ]);
    });

    it('lists removed inner classes of a class', () => {
      const classBefore = 'public class MyClass { class OldInnerClass { } }';
      const oldClass = apexTypeFromRawString(classBefore);
      const classAfter = 'public class MyClass { }';
      const newClass = apexTypeFromRawString(classAfter);

      const oldVersion = { types: [oldClass] };
      const newVersion = { types: [newClass] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newOrModifiedApexMembers).toEqual([
        {
          typeName: 'MyClass',
          modifications: [
            {
              __typename: 'RemovedType',
              name: 'OldInnerClass',
            },
          ],
        },
      ]);
    });

    it('lists new inner interfaces of a class', () => {
      const classBefore = 'public class MyClass { }';
      const oldClass = apexTypeFromRawString(classBefore);
      const classAfter = 'public class MyClass { interface NewInterface { } }';
      const newClass = apexTypeFromRawString(classAfter);

      const oldVersion = { types: [oldClass] };
      const newVersion = { types: [newClass] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newOrModifiedApexMembers).toEqual([
        {
          typeName: 'MyClass',
          modifications: [
            {
              __typename: 'NewType',
              name: 'NewInterface',
            },
          ],
        },
      ]);
    });

    it('lists removed inner interfaces of a class', () => {
      const classBefore = 'public class MyClass { interface OldInterface { } }';
      const oldClass = apexTypeFromRawString(classBefore);
      const classAfter = 'public class MyClass { }';
      const newClass = apexTypeFromRawString(classAfter);

      const oldVersion = { types: [oldClass] };
      const newVersion = { types: [newClass] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newOrModifiedApexMembers).toEqual([
        {
          typeName: 'MyClass',
          modifications: [
            {
              __typename: 'RemovedType',
              name: 'OldInterface',
            },
          ],
        },
      ]);
    });

    it('lists new inner enums of a class', () => {
      const classBefore = 'public class MyClass { }';
      const oldClass = apexTypeFromRawString(classBefore);
      const classAfter = 'public class MyClass { enum NewEnum { } }';
      const newClass = apexTypeFromRawString(classAfter);

      const oldVersion = { types: [oldClass] };
      const newVersion = { types: [newClass] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newOrModifiedApexMembers).toEqual([
        {
          typeName: 'MyClass',
          modifications: [
            {
              __typename: 'NewType',
              name: 'NewEnum',
            },
          ],
        },
      ]);
    });

    it('lists removed inner enums of a class', () => {
      const classBefore = 'public class MyClass { interface OldEnum { } }';
      const oldClass = apexTypeFromRawString(classBefore);
      const classAfter = 'public class MyClass { }';
      const newClass = apexTypeFromRawString(classAfter);

      const oldVersion = { types: [oldClass] };
      const newVersion = { types: [newClass] };

      const changeLog = processChangelog(oldVersion, newVersion);

      expect(changeLog.newOrModifiedApexMembers).toEqual([
        {
          typeName: 'MyClass',
          modifications: [
            {
              __typename: 'RemovedType',
              name: 'OldEnum',
            },
          ],
        },
      ]);
    });
  });
});
