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
    const filePaths = await this.getFilePaths(fileSystem, rootPath);
    const apexFilePaths = filePaths.filter((filePath) => this.isApexFile(filePath));
    const filePromises = apexFilePaths.map((filePath) => this.processFile(fileSystem, filePath, includeMetadata));
    return Promise.all(filePromises);
  }

  private static async getFilePaths(fileSystem: FileSystem, rootPath: string): Promise<string[]> {
    const directoryContents = await fileSystem.readDirectory(rootPath);
    const paths: string[] = [];
    for (const filePath of directoryContents) {
      const currentPath = fileSystem.joinPath(rootPath, filePath);
      if (await fileSystem.isDirectory(currentPath)) {
        paths.push(...(await this.getFilePaths(fileSystem, currentPath)));
      } else {
        paths.push(currentPath);
      }
    }
    return paths;
  }

  private static async processFile(
    fileSystem: FileSystem,
    filePath: string,
    includeMetadata: boolean,
  ): Promise<UnparsedSourceFile> {
    const rawTypeContent = await fileSystem.readFile(filePath);
    const metadataPath = `${filePath}-meta.xml`;
    let rawMetadataContent = null;
    if (includeMetadata) {
      rawMetadataContent = fileSystem.exists(metadataPath) ? await fileSystem.readFile(metadataPath) : null;
    }

    return { filePath, content: rawTypeContent, metadataContent: rawMetadataContent };
  }

  private static isApexFile(currentFile: string): boolean {
    return currentFile.endsWith(APEX_FILE_EXTENSION);
  }
}
