import { Settings, TargetFile } from '../../core/settings';
import { DocumentationBundle, generateDocs, ReflectionError } from '../../core/markdown/generate-docs';
import { MarkdownFile } from '../../core/markdown/markdown-file';
import { FileWriter } from '../file-writer';
import { Logger } from '#utils/logger';
import { flow } from 'fp-ts/function';
import * as E from 'fp-ts/Either';
import { SourceFile } from '../../core/shared/types';

export default flow(
  generateDocumentationBundle,
  E.map(convertToMarkdownFiles),
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

function convertToMarkdownFiles(docBundle: DocumentationBundle): MarkdownFile[] {
  return [
    new MarkdownFile('index', '').addText(docBundle.referenceGuide),
    ...docBundle.docs.map((doc) =>
      new MarkdownFile(`${Settings.getInstance().getNamespacePrefix()}${doc.typeName}`, doc.directory).addText(
        doc.docContents,
      ),
    ),
  ];
}

function writeFilesToSystem(files: MarkdownFile[]) {
  FileWriter.write(files, (file: TargetFile) => {
    Logger.logSingle(`${file.name} processed.`, false, 'green', false);
  });
}

function formatReflectionError(error: ReflectionError) {
  return `Source file: ${error.file}\n${error.message}\n`;
}
