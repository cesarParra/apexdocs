import { OutputFile } from '../model/outputFile';

export class FileContainer {
  _files: OutputFile[] = [];

  files(): OutputFile[] {
    return this._files;
  }

  pushFile(file: OutputFile): void {
    this._files.push(file);
  }
}
