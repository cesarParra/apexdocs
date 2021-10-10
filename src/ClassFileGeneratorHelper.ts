import { Type } from '@cparra/apex-reflection';
import Settings from './Settings';
import Configuration from './Configuration';

export default class ClassFileGeneratorHelper {
  public static getSanitizedGroup(classModel: Type) {
    return this.getClassGroup(classModel)
      .replace(/ /g, '-')
      .replace('.', '');
  }

  public static getFileLink(classModel: Type) {
    const root = Configuration.getConfig()?.root ? Configuration.getConfig()?.root : '';
    let fileLink;
    if (Settings.getInstance().getShouldGroup()) {
      fileLink = `[${classModel.name}](${root}/${this.getSanitizedGroup(
        classModel,
      )}/${classModel.name}.md)`;
    } else {
      fileLink = `[${classModel.name}](${root}/${classModel.name}.md)`;
    }

    return fileLink;
  }

  private static getClassGroup(classModel: Type): string {
    const groupAnnotation = classModel.docComment?.annotations.find(annotation => annotation.name === 'group');
    return groupAnnotation?.body ?? '';
  }
}
