import * as fs from 'fs';
import * as path from 'path';
import * as TE from 'fp-ts/lib/TaskEither';
import { PageData } from '../core/shared/types';
import { pipe } from 'fp-ts/function';

const mkdir: (path: fs.PathLike, options: fs.MakeDirectoryOptions) => TE.TaskEither<NodeJS.ErrnoException, void> =
  TE.taskify(fs.mkdir);

const writeFile: (
  path: fs.PathOrFileDescriptor,
  data: string,
  options?: fs.WriteFileOptions,
) => TE.TaskEither<NodeJS.ErrnoException, void> = TE.taskify(fs.writeFile);

export function writeFiles(files: PageData[], outputDir: string, onWriteCallback?: (file: PageData) => void) {
  return pipe(
    files,
    TE.traverseArray((file) => writeSingle(file, outputDir, onWriteCallback)),
  );
}

function writeSingle(file: PageData, outputDir: string, onWriteCallback?: (file: PageData) => void) {
  const ensureDirectoryExists = ({ outputDocPath }: PageData) =>
    mkdir(path.dirname(outputDocPath), { recursive: true });

  const writeContents = (file: PageData) => writeFile(file.outputDocPath, file.content, 'utf8');

  return pipe(
    resolveTargetLocation(file, outputDir),
    (file) => TE.right(file),
    TE.tapIO(ensureDirectoryExists),
    TE.flatMap(writeContents),
    TE.map(() => onWriteCallback?.(file)),
  );
}

function resolveTargetLocation(file: PageData, outputDir: string): PageData {
  return {
    ...file,
    outputDocPath: path.join(outputDir, file.outputDocPath),
  };
}
