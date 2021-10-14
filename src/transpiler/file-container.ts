import { File } from '../model/file';

export class FileContainer {
  _files: File[] = [];

  files(): File[] {
    return this._files;
  }

  pushFile(file: File): void {
    this._files.push(file);
  }
}
