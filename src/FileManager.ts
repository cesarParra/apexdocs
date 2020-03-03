import Settings from './Settings';
import ClassModel from './model/ClassModel';

export default class FileManager {
  classModels: ClassModel[];

  constructor(classModels: ClassModel[]) {
    this.classModels = classModels;
  }

  // TODO: Make static
  generate() {
    const outputDir = Settings.getInstance().getOutputDir();
    Settings.getInstance()
      .getDocsProcessor()
      .onBeforeProcess(this.classModels, Settings.getInstance().getOutputDir());

    this.classModels.forEach(classModel => {
      Settings.getInstance()
        .getDocsProcessor()
        .process(classModel, outputDir);
    });
  }
}
