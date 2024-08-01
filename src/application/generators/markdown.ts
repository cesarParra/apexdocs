import { Settings } from '../../core/settings';
import { DocumentationPageBundle, generateDocs } from '../../core/markdown/generate-docs';
import { FileWriter } from '../file-writer';
import { Logger } from '#utils/logger';
import { flow } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import { PageData, SourceFile } from '../../core/shared/types';
import { ReflectionError } from '../../core/markdown/reflection/error-handling';

export default flow(
  generateDocumentationBundle,
  E.map(writeFilesToSystem),
  E.mapLeft((errors) => {
    const errorMessages = [
      'Error(s) occurred while parsing files. Please review the following issues:',
      ...errors.map(formatReflectionError),
    ].join('\n');

    Logger.error(errorMessages);
  }),
);

function generateDocumentationBundle(bundles: SourceFile[]) {
  return generateDocs(bundles, {
    scope: Settings.getInstance().scope,
    outputDir: Settings.getInstance().outputDir,
    namespace: Settings.getInstance().getNamespace(),
    sortMembersAlphabetically: Settings.getInstance().sortMembersAlphabetically(),
    defaultGroupName: Settings.getInstance().getDefaultGroupName(),
  });
}

function writeFilesToSystem(files: DocumentationPageBundle) {
  FileWriter.write([files.referenceGuide, ...files.docs], (file: PageData) => {
    Logger.logSingle(`${file.fileName} processed.`, false, 'green', false);
  });
}

function formatReflectionError(error: ReflectionError) {
  return `Source file: ${error.file}\n${error.message}\n`;
}
