import { generateDocs } from '../../core/markdown/generate-docs';
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
import { writeFiles } from '../file-writer';

export class FileWritingError {
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
  );
}

function generateDocumentationBundle(bundles: UnparsedSourceFile[], config: UserDefinedMarkdownConfig) {
  return generateDocs(bundles, {
    ...config,
    referenceGuideTemplate: referenceGuideTemplate,
  });
}

function writeFilesToSystem(files: PostHookDocumentationBundle, outputDir: string) {
  return pipe(
    [files.referenceGuide, ...files.docs].filter((file) => !isSkip(file)),
    (files) => writeFiles(files as PageData[], outputDir),
    TE.mapLeft((error) => {
      return new FileWritingError('An error occurred while writing files to the system.', error);
    }),
  );
}
