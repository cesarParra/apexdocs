import { ClassMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { Logger } from './logger';

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
      Logger.error(`${typeName} - Doc comment parsing error. Level: Type`);
      Logger.error(`Comment:\n ${currentType.docComment.rawDeclaration}`);
      Logger.error(currentType.docComment.error);
      Logger.error('=================================');
    }
  }

  private static logErrorsForClass(classMirror: ClassMirror, parentType?: Type): void {
    const typeName = parentType ? `${parentType!.name}.${classMirror.name}` : classMirror.name;
    classMirror.constructors.forEach((currentConstructor) => {
      if (currentConstructor.docComment?.error) {
        Logger.error(`${typeName} - Doc comment parsing error. Level: Constructor`);
        Logger.error(`Comment:\n ${currentConstructor.docComment.rawDeclaration}`);
        Logger.error(currentConstructor.docComment.error);
        Logger.error('=================================');
      }
    });

    classMirror.fields.forEach((currentField) => {
      if (currentField.docComment?.error) {
        Logger.error(`${typeName} - Doc comment parsing error. Level: Field`);
        Logger.error(`Comment:\n ${currentField.docComment.rawDeclaration}`);
        Logger.error(currentField.docComment.error);
        Logger.error('=================================');
      }
    });

    classMirror.properties.forEach((currentProperty) => {
      if (currentProperty.docComment?.error) {
        Logger.error(`${typeName} - Doc comment parsing error. Level: Property`);
        Logger.error(`Comment:\n ${currentProperty.docComment.rawDeclaration}`);
        Logger.error(currentProperty.docComment.error);
        Logger.error('=================================');
      }
    });

    classMirror.methods.forEach((currentMethod) => {
      if (currentMethod.docComment?.error) {
        Logger.error(`${typeName} - Doc comment parsing error. Level: Method`);
        Logger.error(`Comment:\n ${currentMethod.docComment.rawDeclaration}`);
        Logger.error(currentMethod.docComment.error);
        Logger.error('=================================');
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
        Logger.error(`${interfaceMirror.name} - Doc comment parsing error. Level: Method`);
        Logger.error(`Comment: ${currentMethod.docComment.rawDeclaration}`);
        Logger.error(currentMethod.docComment.error);
        Logger.error('=================================');
      }
    });
  }
}
