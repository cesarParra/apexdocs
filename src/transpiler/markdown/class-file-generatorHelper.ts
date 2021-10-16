import { Type } from '@cparra/apex-reflection';
import { Settings } from '../../settings';

export default class ClassFileGeneratorHelper {
  public static getSanitizedGroup(classModel: Type) {
    return this.getClassGroup(classModel)
      .replace(/ /g, '-')
      .replace('.', '');
  }

  public static getFileLink(classModel: Type) {
    let fileLink;
    if (Settings.getInstance().shouldGroup) {
      fileLink = `[${classModel.name}](/${this.getSanitizedGroup(classModel)}/${classModel.name}.md)`;
    } else {
      fileLink = `[${classModel.name}](/${classModel.name}.md)`;
    }

    return fileLink;
  }

  private static getClassGroup(classModel: Type): string {
    const groupAnnotation = classModel.docComment?.annotations.find(annotation => annotation.name === 'group');
    return groupAnnotation?.body ?? '';
  }
}
