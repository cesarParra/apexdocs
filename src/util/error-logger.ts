import { ClassMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';

export default class ErrorLogger {
  public static logErrors(types: Type[]): void {
    types.forEach((currentType) => {
      this.logErrorsForSingleType(currentType);
    });
  }

  private static logErrorsForSingleType(currentType: Type, parentType?: Type): void {
    this.logTypeErrors(currentType);

    if (currentType.type_name === 'class') {
      this.logErrorsForClass(currentType as ClassMirror);
    } else if (currentType.type_name === 'interface') {
      this.logErrorsForInterface(currentType as InterfaceMirror);
    }
  }

  private static logTypeErrors(currentType: Type, parentType?: Type) {
    if (currentType.docComment?.error) {
      const typeName = parentType ? `${parentType!.name}.${currentType.name}` : currentType.name;
      console.log(`${typeName} - Doc comment parsing error. Level: Type`);
      console.log(`Comment:\n ${currentType.docComment.rawDeclaration}`);
      console.log(currentType.docComment.error);
      console.log('=================================');
    }
  }

  private static logErrorsForClass(classMirror: ClassMirror, parentType?: Type): void {
    const typeName = parentType ? `${parentType!.name}.${classMirror.name}` : classMirror.name;
    classMirror.constructors.forEach((currentConstructor) => {
      if (currentConstructor.docComment?.error) {
        console.log(`${typeName} - Doc comment parsing error. Level: Constructor`);
        console.log(`Comment:\n ${currentConstructor.docComment.rawDeclaration}`);
        console.log(currentConstructor.docComment.error);
        console.log('=================================');
      }
    });

    classMirror.fields.forEach((currentField) => {
      if (currentField.docComment?.error) {
        console.log(`${typeName} - Doc comment parsing error. Level: Field`);
        console.log(`Comment:\n ${currentField.docComment.rawDeclaration}`);
        console.log(currentField.docComment.error);
        console.log('=================================');
      }
    });

    classMirror.properties.forEach((currentProperty) => {
      if (currentProperty.docComment?.error) {
        console.log(`${typeName} - Doc comment parsing error. Level: Property`);
        console.log(`Comment:\n ${currentProperty.docComment.rawDeclaration}`);
        console.log(currentProperty.docComment.error);
        console.log('=================================');
      }
    });

    classMirror.methods.forEach((currentMethod) => {
      if (currentMethod.docComment?.error) {
        console.log(`${typeName} - Doc comment parsing error. Level: Method`);
        console.log(`Comment:\n ${currentMethod.docComment.rawDeclaration}`);
        console.log(currentMethod.docComment.error);
        console.log('=================================');
      }
    });

    classMirror.enums.forEach((currentEnum) => {
      this.logErrorsForSingleType(currentEnum, classMirror);
    });

    classMirror.interfaces.forEach((currentInterface) => {
      this.logErrorsForSingleType(currentInterface, classMirror);
    });

    classMirror.classes.forEach((currentClass) => {
      this.logErrorsForSingleType(currentClass, classMirror);
    });
  }

  private static logErrorsForInterface(interfaceMirror: InterfaceMirror): void {
    interfaceMirror.methods.forEach((currentMethod) => {
      if (currentMethod.docComment?.error) {
        console.log(`${interfaceMirror.name} - Doc comment parsing error. Level: Method`);
        console.log(`Comment: ${currentMethod.docComment.rawDeclaration}`);
        console.log(currentMethod.docComment.error);
        console.log('=================================');
      }
    });
  }
}
