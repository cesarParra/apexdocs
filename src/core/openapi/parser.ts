import { ClassMirror, InterfaceMirror, ReflectionResult, Type } from '@cparra/apex-reflection';
import { Logger } from '#utils/logger';
import { UnparsedApexBundle } from '../shared/types';

export interface TypeParser {
  parse(reflect: (apexBundle: UnparsedApexBundle) => ReflectionResult): Type[];
}

type NameAware = { name: string };

export class RawBodyParser implements TypeParser {
  constructor(
    private logger: Logger,
    public typeBundles: UnparsedApexBundle[],
  ) {}

  parse(reflect: (apexBundle: UnparsedApexBundle) => ReflectionResult): Type[] {
    const types = this.typeBundles
      .map((currentBundle) => {
        this.logger.log(`Parsing file: ${currentBundle.filePath}`);
        return reflect(currentBundle);
      })
      .filter((reflectionResult) => {
        return reflectionResult.typeMirror;
      })
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map((reflectionResult) => reflectionResult.typeMirror!);

    return this.addFieldsFromParent(types);
  }

  addFieldsFromParent(types: Type[]): Type[] {
    const typesWithFields: Type[] = [];
    for (const currentType of types) {
      if (currentType.type_name !== 'class' && currentType.type_name !== 'interface') {
        typesWithFields.push(currentType);
        continue;
      }

      if (currentType.type_name === 'class') {
        let typeAsClass = currentType as ClassMirror;
        if (!typeAsClass.extended_class) {
          typesWithFields.push(currentType);
          continue;
        }

        typeAsClass = this.addMembersFromParent(typeAsClass, types);
        typesWithFields.push(typeAsClass);
        continue;
      }

      // At this stage, we can be sure we are dealing with an interface
      let typeAsInterface = currentType as InterfaceMirror;
      if (!typeAsInterface.extended_interfaces.length) {
        typesWithFields.push(currentType);
        continue;
      }

      typeAsInterface = this.addMethodsFromParent(typeAsInterface, types);
      typesWithFields.push(typeAsInterface);
    }

    return typesWithFields;
  }

  addMembersFromParent(currentClass: ClassMirror, allTypes: Type[]): ClassMirror {
    if (!currentClass.extended_class) {
      return currentClass;
    }
    const parent = allTypes.find((currentType: Type) => currentType.name === currentClass.extended_class);
    if (!parent || parent.type_name !== 'class') {
      return currentClass;
    }

    let parentAsClass = parent as ClassMirror;
    if (parentAsClass.extended_class) {
      parentAsClass = this.addMembersFromParent(parentAsClass, allTypes);
    }

    currentClass.fields = [...currentClass.fields, ...this.getInheritedFields(parentAsClass, currentClass)];
    currentClass.properties = [...currentClass.properties, ...this.getInheritedProperties(parentAsClass, currentClass)];
    currentClass.methods = [...currentClass.methods, ...this.getInheritedMethods(parentAsClass, currentClass)];
    return currentClass;
  }

  addMethodsFromParent(currentInterface: InterfaceMirror, allTypes: Type[]): InterfaceMirror {
    if (!currentInterface.extended_interfaces.length) {
      return currentInterface;
    }

    const parents = [];
    for (const currentInterfaceName of currentInterface.extended_interfaces) {
      const parent = allTypes.find((currentType: Type) => currentType.name === currentInterfaceName);
      if (parent) {
        parents.push(parent);
      }
    }

    for (const parent of parents) {
      let parentAsInterface = parent as InterfaceMirror;
      if (parentAsInterface.extended_interfaces.length) {
        parentAsInterface = this.addMethodsFromParent(parentAsInterface, allTypes);
      }

      currentInterface.methods = [
        ...currentInterface.methods,
        ...this.getInheritedMethods(parentAsInterface, currentInterface),
      ];
    }

    return currentInterface;
  }

  private getInheritedFields(parentAsClass: ClassMirror, currentClass: ClassMirror) {
    return (
      parentAsClass.fields
        // Filter out private fields
        .filter((currentField) => currentField.access_modifier.toLowerCase() !== 'private')
        // Filter out fields that also exist on the child
        .filter((currentField) => !this.memberExists(currentClass.fields, currentField.name))
        .map((currentField) => ({
          ...currentField,
          inherited: true,
        }))
    );
  }

  private getInheritedProperties(parentAsClass: ClassMirror, currentClass: ClassMirror) {
    return (
      parentAsClass.properties
        // Filter out private properties
        .filter((currentProperty) => currentProperty.access_modifier.toLowerCase() !== 'private')
        // Filter out properties that also exist on the child
        .filter((currentProperty) => !this.memberExists(currentClass.properties, currentProperty.name))
        .map((currentProperty) => ({
          ...currentProperty,
          inherited: true,
        }))
    );
  }

  private getInheritedMethods(
    parentAsClass: ClassMirror | InterfaceMirror,
    currentClass: ClassMirror | InterfaceMirror,
  ) {
    return (
      parentAsClass.methods
        // Filter out private methods
        .filter((currentMethod) => currentMethod.access_modifier.toLowerCase() !== 'private')
        // Filter out methods that also exist on the child
        .filter((currentMethod) => !this.memberExists(currentClass.methods, currentMethod.name))
        .map((currentMethod) => ({
          ...currentMethod,
          inherited: true,
        }))
    );
  }

  memberExists(members: NameAware[], fieldName: string): boolean {
    const fieldNames = members.map((currentMember) => currentMember.name);
    return fieldNames.includes(fieldName);
  }
}
