import { generateDocs } from '../../core/markdown/generate-docs';
import { pipe } from 'fp-ts/function';
import {
  PageData,
  PostHookDocumentationBundle,
  UnparsedApexBundle,
  UserDefinedMarkdownConfig,
} from '../../core/shared/types';
import { referenceGuideTemplate } from '../../core/markdown/templates/reference-guide';
import * as TE from 'fp-ts/TaskEither';
import { isSkip } from '../../core/shared/utils';
import { writeFiles } from '../file-writer';
import { FileWritingError } from '../errors';

export default function generate(bundles: UnparsedApexBundle[], config: UserDefinedMarkdownConfig) {
  return pipe(
    generateDocumentationBundle(bundles, config),
    TE.flatMap((files) => writeFilesToSystem(files, config.targetDir)),
  );
}

function generateDocumentationBundle(bundles: UnparsedApexBundle[], config: UserDefinedMarkdownConfig) {
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
