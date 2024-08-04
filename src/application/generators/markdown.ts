import { Settings } from '../../core/settings';
import { generateDocs } from '../../core/markdown/generate-docs';
import { FileWriter } from '../file-writer';
import { Logger } from '#utils/logger';
import { flow } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import { DocumentationBundle, PageData, SourceFile } from '../../core/shared/types';
import { ReflectionError } from '../../core/markdown/reflection/error-handling';
import { referenceGuideTemplate } from '../../core/markdown/templates/reference-guide';

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
    targetDir: Settings.getInstance().outputDir,
    namespace: Settings.getInstance().getNamespace(),
    sortMembersAlphabetically: Settings.getInstance().sortMembersAlphabetically(),
    defaultGroupName: Settings.getInstance().getDefaultGroupName(),
    referenceGuideTemplate: referenceGuideTemplate,
  });
}

function writeFilesToSystem(files: DocumentationBundle) {
  FileWriter.write([files.referenceGuide, ...files.docs], (file: PageData) => {
    Logger.logSingle(`${file.fileName} processed.`, false, 'green', false);
  });
}

function formatReflectionError(error: ReflectionError) {
  return `Source file: ${error.file}\n${error.message}\n`;
}
