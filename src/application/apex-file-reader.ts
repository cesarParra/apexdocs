import { Settings } from '../core/settings';
import { FileSystem } from './file-system';
import { ApexBundle } from '../core/shared/types';

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
    directoryContents.forEach((filePath) => {
      const currentPath = fileSystem.joinPath(rootPath, filePath);
      if (fileSystem.isDirectory(currentPath)) {
        bundles = bundles.concat(this.processFiles(fileSystem, currentPath));
      }

      if (!this.isApexFile(filePath)) {
        return;
      }

      const rawTypeContent = fileSystem.readFile(currentPath);
      const metadataPath = fileSystem.joinPath(rootPath, `${filePath}-meta.xml`);
      let rawMetadataContent = null;
      if (Settings.getInstance().includeMetadata()) {
        rawMetadataContent = fileSystem.exists(metadataPath) ? fileSystem.readFile(metadataPath) : null;
      }

      bundles.push({ filePath, rawTypeContent, rawMetadataContent });
    });
    return bundles;
  }

  private static isApexFile(currentFile: string): boolean {
    return currentFile.endsWith(APEX_FILE_EXTENSION);
  }

  private static get sourceDirectory() {
    return Settings.getInstance().sourceDirectory;
  }
}
