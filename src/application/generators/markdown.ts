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
import { referenceGuideTemplate } from '../../core/markdown/templates/reference-guide';
import * as TE from 'fp-ts/TaskEither';
import { isSkip } from '../../core/shared/utils';
import { ReflectionError } from '../../core/markdown/reflection/reflect-source';

class FileWritingError {
  readonly _tag = 'FileWritingError';
  constructor(
    public message: string,
    public error: unknown,
  ) {}
}

export default function generate(bundles: UnparsedSourceFile[], config: UserDefinedMarkdownConfig) {
  return pipe(
    generateDocumentationBundle(bundles, config),
    TE.flatMap((files) => writeFilesToSystem(files, config.targetDir)),
    TE.mapLeft((error) => {
      if (error._tag === 'HookError') {
        Logger.error('Error(s) occurred while processing hooks. Please review the following issues:');
        Logger.error(error.error);
        return;
      }

      if (error._tag === 'FileWritingError') {
        Logger.error(error.message);
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
  try {
    FileWriter.write(
      [files.referenceGuide, ...files.docs]
        // Filter out any files that should be skipped
        .filter((file) => !isSkip(file)) as PageData[],
      outputDir,
    );
    return TE.right(undefined);
  } catch (error) {
    return TE.left(new FileWritingError('An error occurred while writing files to the system.', error));
  }
}

function formatReflectionError(error: ReflectionError) {
  return `Source file: ${error.file}\n${error.message}\n`;
}
