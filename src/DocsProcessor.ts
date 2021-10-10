import { Type } from '@cparra/apex-reflection';

export default abstract class DocsProcessor {
  // tslint:disable-next-line:no-empty
  public onBeforeProcess(types: Type[], outputDir: string) {}

  abstract process(typeMirror: Type, outputDir: string): void;

  // tslint:disable-next-line:no-empty
  public onAfterProcess(types: Type[], outputDir: string) {}
}
