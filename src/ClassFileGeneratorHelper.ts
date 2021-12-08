import ClassModel from './Model/ClassModel';
import Settings from './Settings';
import Configuration from './Configuration';
import DocsProcessor from './DocsProcessor';

export default class ClassFileGeneratorHelper {
  public static getSanitizedGroup(classModel: ClassModel) {
    return classModel
      .getClassGroup()
      .replace(/ /g, '-')
      .replace('.', '');
  }

  public static getFileLink(classModel: ClassModel, forRelatedReference: boolean = false) {
    let defaultRoot = '';
    if (forRelatedReference && Settings.getInstance().getShouldGroup()) {
      defaultRoot =
        Settings.getInstance()
          .getDocsProcessor()
          ?.defaultRoot() ?? '';
    }

    const root = Configuration.getConfig()?.root ? Configuration.getConfig()?.root : defaultRoot;
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
