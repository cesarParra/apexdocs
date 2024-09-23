import markdown, { FileWritingError } from './generators/markdown';
import openApi from './generators/openapi';
import changelog from './generators/changelog';

import { ApexFileReader } from './apex-file-reader';
import { DefaultFileSystem } from './file-system';
import { Logger } from '#utils/logger';
import {
  UnparsedSourceFile,
  UserDefinedChangelogConfig,
  UserDefinedConfig,
  UserDefinedMarkdownConfig,
  UserDefinedOpenApiConfig,
} from '../core/shared/types';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { ReflectionError, ReflectionErrors } from '../core/markdown/reflection/reflect-source';
import { HookError } from '../core/markdown/generate-docs';

/**
 * Application entry-point to generate documentation out of Apex source files.
 */
export class Apexdocs {
  /**
   * Generates documentation out of Apex source files.
   */
  static async generate(config: UserDefinedConfig, logger: Logger): Promise<E.Either<unknown[], string>> {
    logger.logSingle(`Generating ${config.targetGenerator} documentation...`);

    try {
      switch (config.targetGenerator) {
        case 'markdown':
          return await processMarkdown(config);
        case 'openapi':
          await processOpenApi(config, logger);
          return E.right('✔️ Documentation generated successfully!');
        case 'changelog':
          return await processChangeLog(config);
      }
    } catch (error) {
      return E.left([error]);
    }
  }
}

async function processMarkdown(config: UserDefinedMarkdownConfig) {
  const fileBodies = await ApexFileReader.processFiles(
    new DefaultFileSystem(),
    config.sourceDir,
    config.includeMetadata,
    config.exclude,
  );
  return generateMarkdownDocumentation(fileBodies, config)();
}

async function processOpenApi(config: UserDefinedOpenApiConfig, logger: Logger) {
  const fileBodies = await ApexFileReader.processFiles(
    new DefaultFileSystem(),
    config.sourceDir,
    false,
    config.exclude,
  );
  return openApi(logger, fileBodies, config);
}

function generateDocs(
  fn: () => TE.TaskEither<ReflectionErrors | HookError | FileWritingError, unknown>,
): TE.TaskEither<unknown[], string> {
  return pipe(
    fn(),
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

function generateMarkdownDocumentation(
  fileBodies: UnparsedSourceFile[],
  config: UserDefinedMarkdownConfig,
): TE.TaskEither<unknown[], string> {
  return generateDocs(() => markdown(fileBodies, config));
}

async function processChangeLog(config: UserDefinedChangelogConfig) {
  const previousVersionFiles = await ApexFileReader.processFiles(
    new DefaultFileSystem(),
    config.previousVersionDir,
    false,
    [],
  );

  const currentVersionFiles = await ApexFileReader.processFiles(
    new DefaultFileSystem(),
    config.currentVersionDir,
    false,
    [],
  );

  return generateDocs(() => changelog(previousVersionFiles, currentVersionFiles, config))();
}

function formatReflectionError(error: ReflectionError) {
  return `Source file: ${error.file}\n${error.message}\n`;
}
