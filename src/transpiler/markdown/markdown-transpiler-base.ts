import ProcessorTypeTranspiler from '../processor-type-transpiler';
import { Type } from '@cparra/apex-reflection';
import { FileContainer } from '../file-container';
import { MarkdownHomeFile } from '../../model/markdown-home-file';
import { MarkdownTypeFile } from '../../model/markdown-type-file';

export abstract class MarkdownTranspilerBase extends ProcessorTypeTranspiler {
  protected readonly _fileContainer: FileContainer;

  constructor() {
    super();
    this._fileContainer = new FileContainer();
  }

  abstract homeFileName(): string;

  fileBuilder(): FileContainer {
    return this._fileContainer;
  }

  onBeforeProcess = (types: Type[]) => {
    this._fileContainer.pushFile(new MarkdownHomeFile(this.homeFileName(), types));
  };

  onProcess(type: Type): void {
    this._fileContainer.pushFile(new MarkdownTypeFile(type));
  }
}
