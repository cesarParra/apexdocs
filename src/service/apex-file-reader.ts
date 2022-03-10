import { Settings } from '../settings';
import { FileSystem } from './file-system';

const APEX_FILE_EXTENSION = '.cls';

/**
 * Reads from .cls files and returns their raw body.
 */
export class ApexFileReader {
  /**
   * Reads from .cls files and returns their raw body.
   */
  static processFiles(fileSystem: FileSystem, rootPath: string = this.sourceDirectory): string[] {
    let bodies: string[] = [];

    const directoryContents = fileSystem.readDirectory(rootPath);
    directoryContents.forEach((currentFilePath) => {
      const currentPath = fileSystem.joinPath(rootPath, currentFilePath);
      if (this.readRecursively && fileSystem.isDirectory(currentPath)) {
        bodies = bodies.concat(this.processFiles(fileSystem, currentPath));
      }

      if (!this.isApexFile(currentFilePath)) {
        return;
      }

      const rawFile = fileSystem.readFile(currentPath);
      bodies.push(rawFile);
    });
    return bodies;
  }

  private static isApexFile(currentFile: string): boolean {
    return currentFile.endsWith(APEX_FILE_EXTENSION);
  }

  private static get sourceDirectory() {
    return Settings.getInstance().sourceDirectory;
  }

  private static get readRecursively() {
    return Settings.getInstance().recursive;
  }
}
