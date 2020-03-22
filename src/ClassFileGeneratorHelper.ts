import ClassModel from './model/ClassModel';
import Settings from './Settings';

export default class ClassFileGeneratorHelper {
  public static getSanitizedGroup(classModel: ClassModel) {
    return classModel
      .getClassGroup()
      .replace(/ /g, '-')
      .replace('.', '');
  }

  public static getFileLink(classModel: ClassModel) {
    if (Settings.getInstance().getShouldGroup()) {
      return `[${classModel.getClassName()}](/${this.getSanitizedGroup(classModel)}/${classModel.getClassName()}.md)`;
    }

    return `[${classModel.getClassName()}](/${classModel.getClassName()}.md)`;
  }
}
