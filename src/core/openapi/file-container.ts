import { PageData } from '../shared/types';

export class FileContainer {
  _files: PageData[] = [];

  files(): PageData[] {
    return this._files;
  }

  pushFile(file: PageData): void {
    this._files.push(file);
  }
}
