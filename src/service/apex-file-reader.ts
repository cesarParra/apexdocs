import { Settings } from '../settings';
import { FileSystem } from './file-system';
import ApexBundle from '../model/apex-bundle';

const APEX_FILE_EXTENSION = '.cls';

/**
 * Reads from .cls files and returns their raw body.
 */
export class ApexFileReader {
  /**
   * Reads from .cls files and returns their raw body.
   */
  static processFiles(fileSystem: FileSystem, rootPath: string = this.sourceDirectory): ApexBundle[] {
    let bundles: ApexBundle[] = [];

    const directoryContents = fileSystem.readDirectory(rootPath);
    directoryContents.forEach((currentFilePath) => {
      const currentPath = fileSystem.joinPath(rootPath, currentFilePath);
      if (this.readRecursively && fileSystem.isDirectory(currentPath)) {
        bundles = bundles.concat(this.processFiles(fileSystem, currentPath));
      }

      if (!this.isApexFile(currentFilePath)) {
        return;
      }

      const rawApexFile = fileSystem.readFile(currentPath);
      const metadataPath = fileSystem.joinPath(rootPath, `${currentFilePath}-meta.xml`);
      let rawMetadataFile = null;
      if (Settings.getInstance().includeMetadata()) {
        rawMetadataFile = fileSystem.exists(metadataPath) ? fileSystem.readFile(metadataPath) : null;
      }

      bundles.push(new ApexBundle(currentFilePath, rawApexFile, rawMetadataFile));
    });
    return bundles;
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
