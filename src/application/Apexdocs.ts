import markdown from './generators/markdown';
import openApi from './generators/openapi';

import { ApexFileReader } from './apex-file-reader';
import { DefaultFileSystem } from './file-system';
import { Logger } from '#utils/logger';
import { UnparsedSourceFile, UserDefinedConfig, UserDefinedMarkdownConfig } from '../core/shared/types';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { ReflectionError } from '../core/markdown/reflection/reflect-source';

/**
 * Application entry-point to generate documentation out of Apex source files.
 */
export class Apexdocs {
  /**
   * Generates documentation out of Apex source files.
   */
  static async generate(config: UserDefinedConfig): Promise<E.Either<unknown[], string>> {
    Logger.logSingle(`Generating ${config.targetGenerator} documentation...`);

    //try {
    const fileBodies = await ApexFileReader.processFiles(
      new DefaultFileSystem(),
      config.sourceDir,
      config.targetGenerator === 'markdown' ? config.includeMetadata : false,
    );

    switch (config.targetGenerator) {
      case 'markdown':
        return await generateMarkdownDocumentation(fileBodies, config)();
      case 'openapi':
        await openApi(fileBodies, config);
        return E.right('✔️ Documentation generated successfully!');
    }
    // } catch (error) {
    //   return E.left([error]);
    // }
  }
}

function generateMarkdownDocumentation(
  fileBodies: UnparsedSourceFile[],
  config: UserDefinedMarkdownConfig,
): TE.TaskEither<unknown[], string> {
  return pipe(
    markdown(fileBodies, config),
    TE.map(() => '✔️ Documentation generated successfully!'),
    TE.mapLeft((error) => {
      if (error._tag === 'HookError') {
        return ['Error(s) occurred while processing hooks. Please review the following issues:', error.error];
      }

      if (error._tag === 'FileWritingError') {
        return ['Error(s) occurred while writing files. Please review the following issues:', error.error];
      }

      return [
        'Error(s) occurred while parsing files. Please review the following issues:',
        ...error.errors.map(formatReflectionError),
      ];
    }),
  );
}

function formatReflectionError(error: ReflectionError) {
  return `Source file: ${error.file}\n${error.message}\n`;
}
