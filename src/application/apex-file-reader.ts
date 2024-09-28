import { FileSystem } from './file-system';
import { UnparsedSourceFile } from '../core/shared/types';
import { minimatch } from 'minimatch';
import { pipe } from 'fp-ts/function';
import { apply } from '#utils/fp';

const APEX_FILE_EXTENSION = '.cls';

/**
 * Reads from .cls files and returns their raw body.
 */
export async function processFiles(
  fileSystem: FileSystem,
  rootPath: string,
  includeMetadata: boolean,
  exclude: string[],
): Promise<UnparsedSourceFile[]> {
  const processSingleFile = apply(processFile, fileSystem, includeMetadata);

  return pipe(
    await getFilePaths(fileSystem, rootPath),
    (filePaths) => filePaths.filter((filePath) => !isExcluded(filePath, exclude)),
    (filePaths) => filePaths.filter(isApexFile),
    (filePaths) => Promise.all(filePaths.map(processSingleFile)),
  );
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

async function processFile(
  fileSystem: FileSystem,
  includeMetadata: boolean,
  filePath: string,
): Promise<UnparsedSourceFile> {
  const rawTypeContent = await fileSystem.readFile(filePath);
  const metadataPath = `${filePath}-meta.xml`;
  let rawMetadataContent = null;
  if (includeMetadata) {
    rawMetadataContent = fileSystem.exists(metadataPath) ? await fileSystem.readFile(metadataPath) : null;
  }

  return { filePath, content: rawTypeContent, metadataContent: rawMetadataContent };
}

function isApexFile(currentFile: string): boolean {
  return currentFile.endsWith(APEX_FILE_EXTENSION);
}
