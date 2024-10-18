import * as fs from 'fs';

export interface FileSystem {
  readFile: (path: string) => string;
}

export class DefaultFileSystem implements FileSystem {
  readFile(pathToRead: string): string {
    return fs.readFileSync(pathToRead, 'utf8');
  }
}
