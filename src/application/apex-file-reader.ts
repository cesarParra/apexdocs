import { FileSystem } from './file-system';
import { UnparsedSourceFile } from '../core/shared/types';

const APEX_FILE_EXTENSION = '.cls';

/**
 * Reads from .cls files and returns their raw body.
 */
export class ApexFileReader {
  /**
   * Reads from .cls files and returns their raw body.
   */
  static async processFiles(
    fileSystem: FileSystem,
    rootPath: string,
    includeMetadata: boolean,
  ): Promise<UnparsedSourceFile[]> {
    let bundles: UnparsedSourceFile[] = [];

    const directoryContents = fileSystem.readDirectory(rootPath);
    for (const filePath of directoryContents) {
      const currentPath = fileSystem.joinPath(rootPath, filePath);
      if (await fileSystem.isDirectory(currentPath)) {
        bundles = bundles.concat(await this.processFiles(fileSystem, currentPath, includeMetadata));
      }

      if (!this.isApexFile(filePath)) {
        continue;
      }

      const rawTypeContent = fileSystem.readFile(currentPath);
      const metadataPath = fileSystem.joinPath(rootPath, `${filePath}-meta.xml`);
      let rawMetadataContent = null;
      if (includeMetadata) {
        rawMetadataContent = fileSystem.exists(metadataPath) ? fileSystem.readFile(metadataPath) : null;
      }

      bundles.push({ filePath: currentPath, content: rawTypeContent, metadataContent: rawMetadataContent });
    }
    return bundles;
  }

  private static isApexFile(currentFile: string): boolean {
    return currentFile.endsWith(APEX_FILE_EXTENSION);
  }
}
