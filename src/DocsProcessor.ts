import ClassModel from './model/ClassModel';

export default abstract class DocsProcessor {
  public onBeforeProcess(classes: ClassModel[], outputDir: string) {}
  abstract process(cModel: ClassModel, outputDir: string): void;
  public onAfterProcess(classes: ClassModel[], outputDir: string) {}
}
