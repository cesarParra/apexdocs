import markdown from './generators/markdown';
import openApi from './generators/openapi';

import { ApexFileReader } from './apex-file-reader';
import { DefaultFileSystem } from './file-system';
import { Logger } from '#utils/logger';
import { UnparsedSourceFile, UserDefinedConfig, UserDefinedMarkdownConfig } from '../core/shared/types';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { ReflectionError } from '../core/markdown/reflection/reflect-source';

/**
 * Application entry-point to generate documentation out of Apex source files.
 */
export class Apexdocs {
  /**
   * Generates documentation out of Apex source files.
   */
  static async generate(config: UserDefinedConfig): Promise<void> {
    Logger.logSingle(`Generating ${config.targetGenerator} documentation...`);

    try {
      const fileBodies = await ApexFileReader.processFiles(
        new DefaultFileSystem(),
        config.sourceDir,
        config.targetGenerator === 'markdown' ? config.includeMetadata : false,
      );

      switch (config.targetGenerator) {
        case 'markdown':
          await generateMarkdownDocumentation(fileBodies, config)();
          break;
        case 'openapi':
          await openApi(fileBodies, config);
          break;
      }
    } catch (error) {
      Logger.logSingle(`❌ An error occurred while generating the documentation: ${error}`, 'red');
    }
  }
}

function generateMarkdownDocumentation(fileBodies: UnparsedSourceFile[], config: UserDefinedMarkdownConfig) {
  return pipe(
    markdown(fileBodies, config),
    TE.map(() => Logger.logSingle('✔️ Documentation generated successfully!')),
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
  );
}

function formatReflectionError(error: ReflectionError) {
  return `Source file: ${error.file}\n${error.message}\n`;
}
