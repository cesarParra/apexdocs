import * as fs from 'fs';
import * as path from 'path';

export interface FileSystem {
  isDirectory: (path: string) => Promise<boolean>;
  readDirectory: (sourceDirectory: string) => Promise<string[]>;
  readFile: (path: string) => Promise<string>;
  joinPath: (...paths: string[]) => string;
  exists: (path: string) => boolean;
}

function stat(path: string): Promise<fs.Stats> {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
}

function readdir(path: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

function readFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.toString());
      }
    });
  });
}

export class DefaultFileSystem implements FileSystem {
  async isDirectory(pathToRead: string): Promise<boolean> {
    const stats = await stat(pathToRead);
    return stats.isDirectory();
  }

  readDirectory(sourceDirectory: string): Promise<string[]> {
    return readdir(sourceDirectory);
  }

  readFile(pathToRead: string): Promise<string> {
    return readFile(pathToRead);
  }

  joinPath(...paths: string[]): string {
    return path.join(...paths);
  }

  exists(path: string): boolean {
    return fs.existsSync(path);
  }
}
