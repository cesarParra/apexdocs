import { Type } from '@cparra/apex-reflection';
import { TypesRepository } from '../../model/types-repository';
import { Settings } from '../../settings';

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
      // If the type is not found we return a Markdown hyperlink with whatever we received.
      return `[${typeName}](${typeName})`;
    }

    return this.getFileLink(type);
  }

  private static getClassGroup(classModel: Type): string {
    const groupAnnotation = classModel.docComment?.annotations.find((annotation) => annotation.name === 'group');
    return groupAnnotation?.body ?? Settings.getInstance().getDefaultGroupName();
  }
}
