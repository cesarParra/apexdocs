import { pipe } from 'fp-ts/function';
import { PageData, Skip, UnparsedSourceFile, UserDefinedChangelogConfig } from '../../core/shared/types';
import * as TE from 'fp-ts/TaskEither';
import { writeFiles } from '../file-writer';
import { ChangeLogPageData, generateChangeLog } from '../../core/changelog/generate-change-log';
import { FileWritingError } from '../errors';
import { isSkip } from '../../core/shared/utils';

export default function generate(
  oldBundles: UnparsedSourceFile[],
  newBundles: UnparsedSourceFile[],
  config: UserDefinedChangelogConfig,
) {
  function handleFile(file: ChangeLogPageData | Skip) {
    if (isSkip(file)) {
      return TE.right('✔️ Done! Skipped writing files to the system.');
    }

    return writeFilesToSystem(file, config.targetDir);
  }

  return pipe(generateChangeLog(oldBundles, newBundles, config), TE.flatMap(handleFile));
}

function writeFilesToSystem(pageData: ChangeLogPageData, outputDir: string) {
  return pipe(
    [pageData],
    (files) => writeFiles(files as PageData[], outputDir),
    TE.map(() => '✔️ Changelog generated successfully!'),
    TE.mapLeft((error) => {
      return new FileWritingError('An error occurred while writing files to the system.', error);
    }),
  );
}
