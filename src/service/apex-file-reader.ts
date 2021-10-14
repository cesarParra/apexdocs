import * as fs from 'fs';
import * as path from 'path';
import { Settings } from '../Settings';

/**
 * Reads from .cls files and returns their raw body.
 */
export class ApexFileReader {
  /**
   * Reads from .cls files and returns their raw body.
   */
  processFiles(): string[] {
    let bodies: string[] = [];

    const directoryContents = fs.readdirSync(this.sourceDirectory);
    directoryContents.forEach(currentFile => {
      const currentPath = path.join(this.sourceDirectory, currentFile);
      if (this.readRecursively && fs.statSync(currentPath).isDirectory()) {
        bodies = bodies.concat(this.processFiles());
      }

      if (!currentFile.endsWith('.cls')) {
        return;
      }

      const rawFile = fs.readFileSync(currentPath);
      bodies.push(rawFile.toString());
    });
    return bodies;
  }

  get sourceDirectory() {
    return Settings.getInstance().sourceDirectory;
  }

  get readRecursively() {
    return Settings.getInstance().recursive;
  }
}
