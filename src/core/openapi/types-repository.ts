import { ClassMirror, Type } from '@cparra/apex-reflection';

export type TypeBundle = { type: Type; isChild: boolean; parentType?: Type };

export class TypesRepository {
  private static instance: TypesRepository;
  private allTypes: Type[] = [];

  public static getInstance(): TypesRepository {
    if (!TypesRepository.instance) {
      TypesRepository.instance = new TypesRepository();
    }
    return TypesRepository.instance;
  }

  public populateAll(types: Type[]) {
    this.allTypes = types;
  }

  public getFromAllByName(typeName: string): TypeBundle | undefined {
    if (typeName.includes('.')) {
      // If it includes a dot we are assuming we are dealing with an inner class.
      const [parentTypeName, childTypeName] = typeName.split('.');
      const parentReference = this.allTypes.find(
        (currentType: Type) => currentType.name.toLowerCase() === parentTypeName.toLowerCase(),
      );
      if (!parentReference || parentReference.type_name !== 'class') {
        // If the parent is not found, no reason to keep searching, instead we return undefined.
        // Similarly, if the parent is not a class, it means it cannot have children, so we return early.
        return undefined;
      }

      const parentReferenceAsClass = parentReference as ClassMirror;
      const childTypes = [
        ...parentReferenceAsClass.classes,
        ...parentReferenceAsClass.interfaces,
        ...parentReferenceAsClass.enums,
      ];
      const foundType = childTypes.find((currentType: Type) => currentType.name.toLowerCase() === childTypeName);
      if (!foundType) {
        return undefined;
      }
      return { type: foundType, isChild: true, parentType: parentReference };
    }

    const foundType = this.allTypes.find(
      (currentType: Type) => currentType.name.toLowerCase() === typeName.toLowerCase(),
    );
    if (!foundType) {
      return undefined;
    }
    return { type: foundType, isChild: false };
  }
}
