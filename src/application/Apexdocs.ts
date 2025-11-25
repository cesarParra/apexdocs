import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';

import markdown from './generators/markdown';
import openApi from './generators/openapi';
import changelog from './generators/changelog';

import { allComponentTypes, processFiles } from './source-code-file-reader';
import { DefaultFileSystem } from './file-system';
import { Logger } from '#utils/logger';
import {
  UnparsedApexBundle,
  UserDefinedChangelogConfig,
  UserDefinedConfig,
  UserDefinedMarkdownConfig,
  UserDefinedOpenApiConfig,
} from '../core/shared/types';
import { resolveAndValidateSourceDirectories } from '#utils/source-directory-resolver';
import { ReflectionError, ReflectionErrors, HookError } from '../core/errors/errors';
import { FileReadingError, FileWritingError } from './errors';
import { apply } from '#utils/fp';

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
          return (await processMarkdown(config))();
        case 'openapi':
          await processOpenApi(config, logger);
          return E.right('✔️ Documentation generated successfully!');
        case 'changelog':
          return (await processChangeLog(config))();
      }
    } catch (error) {
      return E.left([error]);
    }
  }
}

const readFiles = apply(processFiles, new DefaultFileSystem());

async function processMarkdown(config: UserDefinedMarkdownConfig) {
  return pipe(
    resolveAndValidateSourceDirectories(config),
    E.mapLeft((error) => new FileReadingError(`Failed to resolve source directories: ${error.message}`, error)),
    E.flatMap((sourceDirs) =>
      E.tryCatch(
        () =>
          readFiles({ experimentalLwcSupport: config.experimentalLwcSupport })(allComponentTypes, {
            includeMetadata: config.includeMetadata,
          })(sourceDirs, config.exclude),
        (e) => new FileReadingError('An error occurred while reading files.', e),
      ),
    ),
    TE.fromEither,
    TE.flatMap((fileBodies) => markdown(fileBodies, config)),
    TE.map(() => '✔️ Documentation generated successfully!'),
    TE.mapLeft(toErrors),
  );
}

async function processOpenApi(config: UserDefinedOpenApiConfig, logger: Logger) {
  return pipe(
    resolveAndValidateSourceDirectories(config),
    E.mapLeft((error) => new FileReadingError(`Failed to resolve source directories: ${error.message}`, error)),
    TE.fromEither,
    TE.flatMap((sourceDirs) =>
      TE.tryCatch(
        () => {
          const fileBodies = readFiles({ experimentalLwcSupport: false })(['ApexClass'])(
            sourceDirs,
            config.exclude,
          ) as UnparsedApexBundle[];
          return openApi(logger, fileBodies, config);
        },
        (e) => new FileReadingError('An error occurred while generating OpenAPI documentation.', e),
      ),
    ),
  );
}

async function processChangeLog(config: UserDefinedChangelogConfig) {
  function loadFiles() {
    const previousVersionConfig = {
      sourceDir: config.previousVersionDir,
    };

    const currentVersionConfig = {
      sourceDir: config.currentVersionDir,
    };

    return pipe(
      E.Do,
      E.bind('previousVersionDirs', () =>
        pipe(
          resolveAndValidateSourceDirectories(previousVersionConfig),
          E.mapLeft(
            (error) =>
              new FileReadingError(`Failed to resolve previous version source directories: ${error.message}`, error),
          ),
        ),
      ),
      E.bind('currentVersionDirs', () =>
        pipe(
          resolveAndValidateSourceDirectories(currentVersionConfig),
          E.mapLeft(
            (error) =>
              new FileReadingError(`Failed to resolve current version source directories: ${error.message}`, error),
          ),
        ),
      ),
      E.map(({ previousVersionDirs, currentVersionDirs }) => [
        readFiles({ experimentalLwcSupport: false })(allComponentTypes)(previousVersionDirs, config.exclude),
        readFiles({ experimentalLwcSupport: false })(allComponentTypes)(currentVersionDirs, config.exclude),
      ]),
    );
  }

  return pipe(
    loadFiles(),
    TE.fromEither,
    TE.flatMap(([previous, current]) => changelog(previous, current, config)),
    TE.mapLeft(toErrors),
  );
}

function toErrors(error: ReflectionErrors | HookError | FileReadingError | FileWritingError): unknown[] {
  switch (error._tag) {
    case 'HookError':
      return ['Error(s) occurred while processing hooks. Please review the following issues:', error.error];
    case 'FileReadingError':
      return ['Error(s) occurred while reading files. Please review the following issues:', error.error];
    case 'FileWritingError':
      return ['Error(s) occurred while writing files. Please review the following issues:', error.error];
    default:
      return [
        'Error(s) occurred while parsing files. Please review the following issues:',
        ...error.errors.map(formatReflectionError),
      ];
  }
}

function formatReflectionError(error: ReflectionError) {
  return `Source file: ${error.file}\n${error.message}\n`;
}
