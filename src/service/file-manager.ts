import { Type } from '@cparra/apex-reflection';
import { Settings } from '../Settings';

export default class FileManager {
  static generate(types: Type[]) {
    const sortedClasses = types.sort((classA, classB) => {
      if (classA.name < classB.name) return -1;
      if (classA.name > classB.name) return 1;
      return 0;
    });

    const docsProcessor = Settings.getInstance().docsProcessor;

    if (!docsProcessor) {
      return;
    }

    const outputDir = Settings.getInstance().outputDir;
    docsProcessor.onBeforeProcess(sortedClasses, Settings.getInstance().outputDir);

    sortedClasses.forEach(classModel => {
      docsProcessor.process(classModel, outputDir);
    });
  }
}
