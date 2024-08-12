import { generateDocs } from '../../core/markdown/generate-docs';
import { FileWriter } from '../file-writer';
import { Logger } from '#utils/logger';
import { pipe } from 'fp-ts/function';
import {
  PageData,
  PostHookDocumentationBundle,
  UnparsedSourceFile,
  UserDefinedMarkdownConfig,
} from '../../core/shared/types';
import { ReflectionError } from '../../core/markdown/reflection/error-handling';
import { referenceGuideTemplate } from '../../core/markdown/templates/reference-guide';
import * as TE from 'fp-ts/TaskEither';
import { isSkip } from '../../core/shared/utils';

export default function generate(bundles: UnparsedSourceFile[], config: UserDefinedMarkdownConfig) {
  return pipe(
    generateDocumentationBundle(bundles, config),
    TE.map((files) => writeFilesToSystem(files, config.targetDir)),
    TE.mapLeft((error) => {
      if (error._tag === 'HookError') {
        Logger.error('Error(s) occurred while processing hooks. Please review the following issues:');
        Logger.error(error.error);
        return;
      }

      const errorMessages = [
        'Error(s) occurred while parsing files. Please review the following issues:',
        ...error.errors.map(formatReflectionError),
      ].join('\n');

      Logger.error(errorMessages);
    }),
  )();
}

function generateDocumentationBundle(bundles: UnparsedSourceFile[], config: UserDefinedMarkdownConfig) {
  return generateDocs(bundles, {
    ...config,
    referenceGuideTemplate: referenceGuideTemplate,
  });
}

function writeFilesToSystem(files: PostHookDocumentationBundle, outputDir: string) {
  FileWriter.write(
    [files.referenceGuide, ...files.docs]
      // Filter out any files that should be skipped
      .filter((file) => !isSkip(file)) as PageData[],
    outputDir,
    (file: PageData) => {
      Logger.logSingle(`${file.filePath} processed.`, false, 'green', false);
    },
  );
}

function formatReflectionError(error: ReflectionError) {
  return `Source file: ${error.file}\n${error.message}\n`;
}
