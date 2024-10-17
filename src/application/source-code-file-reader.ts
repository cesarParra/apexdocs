import { FileSystem } from './file-system';
import { UnparsedApexBundle, UnparsedObjectBundle } from '../core/shared/types';
import { minimatch } from 'minimatch';
import { pipe } from 'fp-ts/function';

/**
 * Reads from source code files and returns their raw body.
 */
export function processFiles(fileSystem: FileSystem) {
  return function <T extends UnparsedApexBundle | UnparsedObjectBundle>(processors: FileProcessor<T>[]) {
    return async function (rootPath: string, exclude: string[]): Promise<T[]> {
      return pipe(
        await getFilePaths(fileSystem, rootPath),
        (filePaths) => filePaths.filter((filePath) => !isExcluded(filePath, exclude)),
        (filteredFilePaths) => readFiles(fileSystem, filteredFilePaths, processors),
      );
    };
  };
}

async function readFiles<T extends UnparsedApexBundle | UnparsedObjectBundle>(
  fileSystem: FileSystem,
  filePaths: string[],
  processors: FileProcessor<T>[],
): Promise<T[]> {
  const files: T[] = [];
  for (const filePath of filePaths) {
    const processor = processors.find((p) => p.isSupportedFile(filePath));
    if (processor) {
      files.push(await processor.process(fileSystem, filePath));
    }
  }
  return files;
}

async function getFilePaths(fileSystem: FileSystem, rootPath: string): Promise<string[]> {
  const directoryContents = await fileSystem.readDirectory(rootPath);
  const paths: string[] = [];
  for (const filePath of directoryContents) {
    const currentPath = fileSystem.joinPath(rootPath, filePath);
    if (await fileSystem.isDirectory(currentPath)) {
      paths.push(...(await getFilePaths(fileSystem, currentPath)));
    } else {
      paths.push(currentPath);
    }
  }
  return paths;
}

function isExcluded(filePath: string, exclude: string[]): boolean {
  return exclude.some((pattern) => minimatch(filePath, pattern));
}

interface FileProcessor<T extends UnparsedApexBundle | UnparsedObjectBundle> {
  isSupportedFile: (currentFile: string) => boolean;
  process: (fileSystem: FileSystem, filePath: string) => Promise<T>;
}

export function processApexFiles(includeMetadata: boolean): FileProcessor<UnparsedApexBundle> {
  return new ApexFileReader(includeMetadata);
}

class ApexFileReader implements FileProcessor<UnparsedApexBundle> {
  APEX_FILE_EXTENSION = '.cls';

  constructor(public includeMetadata: boolean) {}

  isSupportedFile(currentFile: string): boolean {
    return currentFile.endsWith(this.APEX_FILE_EXTENSION);
  }

  async process(fileSystem: FileSystem, filePath: string): Promise<UnparsedApexBundle> {
    const rawTypeContent = await fileSystem.readFile(filePath);
    const metadataPath = `${filePath}-meta.xml`;
    let rawMetadataContent = null;
    if (this.includeMetadata) {
      rawMetadataContent = fileSystem.exists(metadataPath) ? await fileSystem.readFile(metadataPath) : null;
    }

    return { type: 'apex', filePath, content: rawTypeContent, metadataContent: rawMetadataContent };
  }
}

export function processObjectFiles(): FileProcessor<UnparsedObjectBundle> {
  return new ObjectFileReader();
}

class ObjectFileReader implements FileProcessor<UnparsedObjectBundle> {
  OBJECT_FILE_EXTENSION = '.object-meta.xml';

  isSupportedFile(currentFile: string): boolean {
    return currentFile.endsWith(this.OBJECT_FILE_EXTENSION);
  }

  async process(fileSystem: FileSystem, filePath: string): Promise<UnparsedObjectBundle> {
    const rawTypeContent = await fileSystem.readFile(filePath);
    return { type: 'object', filePath, content: rawTypeContent };
  }
}
