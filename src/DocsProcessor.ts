import ClassModel from './model/ClassModel';

export default abstract class DocsProcessor {
  // tslint:disable-next-line:no-empty
  public onBeforeProcess(classes: ClassModel[], outputDir: string) {
  }

  abstract process(cModel: ClassModel, outputDir: string): void;

  // tslint:disable-next-line:no-empty
  public onAfterProcess(classes: ClassModel[], outputDir: string) {
  }

  public defaultRoot(): string {
    return '';
  }
}
