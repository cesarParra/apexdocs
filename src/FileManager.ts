import Settings from './Settings';
import ClassModel from './Model/ClassModel';

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

    const docsProcessor = Settings.getInstance().getDocsProcessor();

    if (!docsProcessor) {
      return;
    }

    const outputDir = Settings.getInstance().getOutputDir();
    docsProcessor.onBeforeProcess(sortedClasses, Settings.getInstance().getOutputDir());

    sortedClasses.forEach(classModel => {
      docsProcessor.process(classModel, outputDir);
    });
  }
}
