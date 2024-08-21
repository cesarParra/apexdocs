import * as fs from 'fs';
import * as path from 'path';

export interface FileSystem {
  isDirectory: (path: string) => Promise<boolean>;
  readDirectory: (sourceDirectory: string) => string[];
  readFile: (path: string) => string;
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

export class DefaultFileSystem implements FileSystem {
  async isDirectory(pathToRead: string): Promise<boolean> {
    const stats = await stat(pathToRead);
    return stats.isDirectory();
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
