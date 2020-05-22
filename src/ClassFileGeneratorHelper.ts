import ClassModel from './model/ClassModel';
import Settings from './Settings';
import Configuration from './Configuration';

export default class ClassFileGeneratorHelper {
  public static getSanitizedGroup(classModel: ClassModel) {
    return classModel
      .getClassGroup()
      .replace(/ /g, '-')
      .replace('.', '');
  }

  public static getFileLink(classModel: ClassModel) {
    const root = Configuration.getConfig()?.root ? Configuration.getConfig()?.root : '';
    let fileLink;
    if (Settings.getInstance().getShouldGroup()) {
      fileLink = `[${classModel.getClassName()}](${root}/${this.getSanitizedGroup(
        classModel,
      )}/${classModel.getClassName()}.md)`;
    } else {
      fileLink = `[${classModel.getClassName()}](${root}/${classModel.getClassName()}.md)`;
    }

    return fileLink;
  }
}
