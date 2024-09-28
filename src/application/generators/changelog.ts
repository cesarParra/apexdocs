import { pipe } from 'fp-ts/function';
import { PageData, UnparsedSourceFile, UserDefinedChangelogConfig } from '../../core/shared/types';
import * as TE from 'fp-ts/TaskEither';
import { writeFiles } from '../file-writer';
import { ChangeLogPageData, generateChangeLog } from '../../core/changelog/generate-change-log';
import { FileWritingError } from '../errors';

export default function generate(
  oldBundles: UnparsedSourceFile[],
  newBundles: UnparsedSourceFile[],
  config: UserDefinedChangelogConfig,
) {
  return pipe(
    generateChangeLog(oldBundles, newBundles, config),
    TE.flatMap((files) => writeFilesToSystem(files, config.targetDir)),
  );
}

function writeFilesToSystem(pageData: ChangeLogPageData, outputDir: string) {
  return pipe(
    [pageData],
    (files) => writeFiles(files as PageData[], outputDir),
    TE.mapLeft((error) => {
      return new FileWritingError('An error occurred while writing files to the system.', error);
    }),
  );
}
