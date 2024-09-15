import { ClassMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { Logger } from './logger';

export default class ErrorLogger {
  public static logErrors(logger: Logger, types: Type[]): void {
    types.forEach((currentType) => {
      this.logErrorsForSingleType(logger, currentType);
    });
  }

  private static logErrorsForSingleType(logger: Logger, currentType: Type): void {
    this.logTypeErrors(logger, currentType);

    if (currentType.type_name === 'class') {
      this.logErrorsForClass(logger, currentType as ClassMirror);
    } else if (currentType.type_name === 'interface') {
      this.logErrorsForInterface(logger, currentType as InterfaceMirror);
    }
  }

  private static logTypeErrors(logger: Logger, currentType: Type, parentType?: Type) {
    if (currentType.docComment?.error) {
      const typeName = parentType ? `${parentType!.name}.${currentType.name}` : currentType.name;
      logger.error(`${typeName} - Doc comment parsing error. Level: Type`);
      logger.error(`Comment:\n ${currentType.docComment.rawDeclaration}`);
      logger.error(currentType.docComment.error);
      logger.error('=================================');
    }
  }

  private static logErrorsForClass(logger: Logger, classMirror: ClassMirror, parentType?: Type): void {
    const typeName = parentType ? `${parentType!.name}.${classMirror.name}` : classMirror.name;
    classMirror.constructors.forEach((currentConstructor) => {
      if (currentConstructor.docComment?.error) {
        logger.error(`${typeName} - Doc comment parsing error. Level: Constructor`);
        logger.error(`Comment:\n ${currentConstructor.docComment.rawDeclaration}`);
        logger.error(currentConstructor.docComment.error);
        logger.error('=================================');
      }
    });

    classMirror.fields.forEach((currentField) => {
      if (currentField.docComment?.error) {
        logger.error(`${typeName} - Doc comment parsing error. Level: Field`);
        logger.error(`Comment:\n ${currentField.docComment.rawDeclaration}`);
        logger.error(currentField.docComment.error);
        logger.error('=================================');
      }
    });

    classMirror.properties.forEach((currentProperty) => {
      if (currentProperty.docComment?.error) {
        logger.error(`${typeName} - Doc comment parsing error. Level: Property`);
        logger.error(`Comment:\n ${currentProperty.docComment.rawDeclaration}`);
        logger.error(currentProperty.docComment.error);
        logger.error('=================================');
      }
    });

    classMirror.methods.forEach((currentMethod) => {
      if (currentMethod.docComment?.error) {
        logger.error(`${typeName} - Doc comment parsing error. Level: Method`);
        logger.error(`Comment:\n ${currentMethod.docComment.rawDeclaration}`);
        logger.error(currentMethod.docComment.error);
        logger.error('=================================');
      }
    });

    classMirror.enums.forEach((currentEnum) => {
      this.logErrorsForSingleType(logger, currentEnum);
    });

    classMirror.interfaces.forEach((currentInterface) => {
      this.logErrorsForSingleType(logger, currentInterface);
    });

    classMirror.classes.forEach((currentClass) => {
      this.logErrorsForSingleType(logger, currentClass);
    });
  }

  private static logErrorsForInterface(logger: Logger, interfaceMirror: InterfaceMirror): void {
    interfaceMirror.methods.forEach((currentMethod) => {
      if (currentMethod.docComment?.error) {
        logger.error(`${interfaceMirror.name} - Doc comment parsing error. Level: Method`);
        logger.error(`Comment: ${currentMethod.docComment.rawDeclaration}`);
        logger.error(currentMethod.docComment.error);
        logger.error('=================================');
      }
    });
  }
}
