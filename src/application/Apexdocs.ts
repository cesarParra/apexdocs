import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { simpleGit } from 'simple-git';

import markdown from './generators/markdown';
import openApi from './generators/openapi';
import changelog from './generators/changelog';

import { processFiles } from './apex-file-reader';
import { DefaultFileSystem } from './file-system';
import { Logger } from '#utils/logger';
import {
  UnparsedSourceFile,
  UserDefinedChangelogConfig,
  UserDefinedConfig,
  UserDefinedMarkdownConfig,
  UserDefinedOpenApiConfig,
} from '../core/shared/types';
import { ReflectionError, ReflectionErrors, HookError } from '../core/errors/errors';
import { FileReadingError, FileWritingError, GitCloneError } from './errors';
import { apply } from '#utils/fp';
import path from 'node:path';
import * as fs from 'node:fs';

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
    TE.tryCatch(
      () => readFiles(config.sourceDir, config.includeMetadata, config.exclude),
      (e) => new FileReadingError('An error occurred while reading files.', e),
    ),
    TE.flatMap((fileBodies) => markdown(fileBodies, config)),
    TE.map(() => '✔️ Documentation generated successfully!'),
    TE.mapLeft(toErrors),
  );
}

async function processOpenApi(config: UserDefinedOpenApiConfig, logger: Logger) {
  const fileBodies = await readFiles(config.sourceDir, false, config.exclude);
  return openApi(logger, fileBodies, config);
}

async function processChangeLog(config: UserDefinedChangelogConfig) {
  const previousVersionDir = path.join(process.cwd(), '.apexdocs');
  async function clonePreviousVersionOfRepo() {
    // Clones the previous version of the repository to a temporary directory.
    // Returns the path to the cloned repository.
    if (config.repoPath && config.previousGitReference) {
      await simpleGit().clone(config.repoPath, previousVersionDir, {
        '--branch': config.previousGitReference,
      });
      return previousVersionDir;
    }

    return '';
  }

  async function loadFiles(pathRoot = ''): Promise<[UnparsedSourceFile[], UnparsedSourceFile[]]> {
    return [
      await readFiles(path.join(pathRoot, config.previousVersionDir), false, config.exclude),
      await readFiles(config.currentVersionDir, false, config.exclude),
    ];
  }

  function removeTemporaryDirectory() {
    if (fs.existsSync(previousVersionDir)) {
      fs.rmSync(previousVersionDir, { recursive: true, force: true });
    }
  }

  return pipe(
    TE.tryCatch(clonePreviousVersionOfRepo, (e) => new GitCloneError('', e)),
    TE.flatMap((pathRoot) =>
      TE.tryCatch(apply(loadFiles, pathRoot), (e) => new FileReadingError('An error occurred while reading files.', e)),
    ),
    TE.flatMap(([previous, current]) => changelog(previous, current, config)),
    TE.map(removeTemporaryDirectory),
    TE.map(() => '✔️ Changelog generated successfully!'),
    TE.mapLeft(toErrors),
  );
}

function toErrors(
  error: ReflectionErrors | HookError | FileReadingError | FileWritingError | GitCloneError,
): unknown[] {
  switch (error._tag) {
    case 'HookError':
      return ['Error(s) occurred while processing hooks. Please review the following issues:', error.error];
    case 'FileReadingError':
      return ['Error(s) occurred while reading files. Please review the following issues:', error.error];
    case 'FileWritingError':
      return ['Error(s) occurred while writing files. Please review the following issues:', error.error];
    case 'GitCloneError':
      return [`${error.error}`];
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
