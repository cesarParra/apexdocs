import { generateDocs } from '../../core/markdown/generate-docs';
import { FileWriter } from '../file-writer';
import { Logger } from '#utils/logger';
import { pipe } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import { DocumentationBundle, PageData, SourceFile, UserDefinedMarkdownConfig } from '../../core/shared/types';
import { ReflectionError } from '../../core/markdown/reflection/error-handling';
import { referenceGuideTemplate } from '../../core/markdown/templates/reference-guide';

export default function generate(bundles: SourceFile[], config: UserDefinedMarkdownConfig) {
  return pipe(
    generateDocumentationBundle(bundles, config),
    E.map((files) => writeFilesToSystem(files, config.targetDir)),
    E.mapLeft((errors) => {
      const errorMessages = [
        'Error(s) occurred while parsing files. Please review the following issues:',
        ...errors.map(formatReflectionError),
      ].join('\n');

      Logger.error(errorMessages);
    }),
  );
}

function generateDocumentationBundle(bundles: SourceFile[], config: UserDefinedMarkdownConfig) {
  return generateDocs(bundles, {
    ...config,
    referenceGuideTemplate: referenceGuideTemplate,
  });
}

function writeFilesToSystem(files: DocumentationBundle, outputDir: string) {
  FileWriter.write([files.referenceGuide, ...files.docs], outputDir, (file: PageData) => {
    Logger.logSingle(`${file.fileName} processed.`, false, 'green', false);
  });
}

function formatReflectionError(error: ReflectionError) {
  return `Source file: ${error.file}\n${error.message}\n`;
}
