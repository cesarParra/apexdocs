import { Type } from '@cparra/apex-reflection';
import { TypesRepository } from '../../model/types-repository';

export default class ClassFileGeneratorHelper {
  public static getSanitizedGroup(classModel: Type) {
    return this.getClassGroup(classModel).replace(/ /g, '-').replace('.', '');
  }

  public static getFileLink(classModel: Type) {
    return `[${classModel.name}](/${this.getSanitizedGroup(classModel)}/${classModel.name}.md)`;
  }

  public static getFileLinkByTypeName(typeName: string) {
    const type = TypesRepository.getInstance().getByName(typeName);
    if (!type) {
      // If the type is not found we simply return the file name we received
      return typeName;
    }

    return this.getFileLink(type);
  }

  private static getClassGroup(classModel: Type): string {
    const groupAnnotation = classModel.docComment?.annotations.find((annotation) => annotation.name === 'group');
    return groupAnnotation?.body ?? 'Misc';
  }
}
