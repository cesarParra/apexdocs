import ProcessorTypeTranspiler from '../processor-type-transpiler';
import { Type } from '@cparra/apex-reflection';
import { FileContainer } from '../file-container';
import { MarkdownHomeFile } from '../../model/markdown-home-file';
import { MarkdownTypeFile } from '../../model/markdown-type-file';

export class MarkdownTranspilerBase extends ProcessorTypeTranspiler {
  private readonly _fileContainer: FileContainer;

  constructor() {
    super();
    this._fileContainer = new FileContainer();
  }

  fileBuilder(): FileContainer {
    return this._fileContainer;
  }

  onBeforeProcess = (types: Type[]) => {
    // TODO: Avoid hardcoding the file name as there are different type of files
    this._fileContainer.pushFile(new MarkdownHomeFile('index.md', types));
  };

  onProcess(type: Type): void {
    this._fileContainer.pushFile(new MarkdownTypeFile(type));
  }

  onAfterProcess = (types: Type[]) => {
    // TODO: Make sure that we resolve all links
  };
}
