import * as fs from 'fs';
import * as path from 'path';

export interface FileSystem {
  readDirectory: (sourceDirectory: string) => string[];
  isDirectory: (path: string) => boolean;
  readFile: (path: string) => string;
  joinPath: (...paths: string[]) => string;
  exists: (path: string) => boolean;
}

export class DefaultFileSystem implements FileSystem {
  isDirectory(pathToRead: string): boolean {
    return fs.statSync(pathToRead).isDirectory();
  }

  readDirectory(sourceDirectory: string): string[] {
    return fs.readdirSync(sourceDirectory);
  }

  readFile(pathToRead: string): string {
    const rawFile = fs.readFileSync(pathToRead);
    return rawFile.toString();
  }

  joinPath(...paths: string[]): string {
    return path.join(...paths);
  }

  exists(path: string): boolean {
    return fs.existsSync(path);
  }
}
