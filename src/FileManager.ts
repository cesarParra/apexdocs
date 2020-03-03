import Settings from './Settings';
import ClassModel from './model/ClassModel';

export default class FileManager {
  classModels: ClassModel[];

  constructor(classModels: ClassModel[]) {
    this.classModels = classModels;
  }

  // TODO: Make static
  generate() {
    const sortedClasses = this.classModels.sort((classA, classB) => {
      if (classA.getClassName() < classB.getClassName()) return -1;
      if (classA.getClassName() > classB.getClassName()) return 1;
      return 0;
    });

    const outputDir = Settings.getInstance().getOutputDir();
    Settings.getInstance()
      .getDocsProcessor()
      .onBeforeProcess(sortedClasses, Settings.getInstance().getOutputDir());

    sortedClasses.forEach(classModel => {
      Settings.getInstance()
        .getDocsProcessor()
        .process(classModel, outputDir);
    });
  }
}
