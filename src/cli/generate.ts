#!/usr/bin/env node
import { Apexdocs } from '../application/Apexdocs';
import { extractArgs } from './args';
import { StdOutLogger } from '#utils/logger';
import * as E from 'fp-ts/Either';
import { UserDefinedConfig } from '../core/shared/types';
import { createReflectionDebugLogger } from '#utils/reflection-debug-logger';

function isDebugEnabledFromProcessArgs(): boolean {
  return process.argv.includes('--debug');
}

const logger = new StdOutLogger();
logger.setDebug(isDebugEnabledFromProcessArgs());
const reflectionDebugLogger = createReflectionDebugLogger(logger);

function main() {
  const aggregatedFailures: unknown[] = [];
  let commandsRun = 0;

  function printDebugSummary() {
    if (!logger.isDebugEnabled()) {
      return;
    }

    logger.debug(`commandsRun=${commandsRun}`);
    logger.debug(`aggregatedFailures=${aggregatedFailures.length}`);
  }

  function printFailuresAtEnd() {
    if (aggregatedFailures.length === 0) {
      return;
    }

    logger.logSingle('⚠️ Some operations completed with errors. Please review the following issues:', 'red');
    for (const failure of aggregatedFailures) {
      logger.error(failure);
    }
  }

  function parseResult(result: E.Either<unknown, string>, config: UserDefinedConfig) {
    E.match(
      (failure) => {
        logger.logSingle(`${config.targetGenerator}: completed with errors`, 'red');
        aggregatedFailures.push(failure);
      },
      (successMessage: string) => {
        logger.logSingle(successMessage);
      },
    )(result);
  }

  function catchUnexpectedError(error: Error | unknown) {
    logger.error(`❌ An error occurred while processing the request: ${error}`);
    process.exit(1);
  }

  extractArgs()
    .then(async (maybeConfigs) => {
      E.match(catchUnexpectedError, async (configs: readonly UserDefinedConfig[]) => {
        for (const config of configs) {
          commandsRun++;

          if (logger.isDebugEnabled()) {
            logger.debug(`Currently processing generator: ${config.targetGenerator}`);
          }

          const result = await Apexdocs.generate(config, { logger, reflectionDebugLogger });

          if (logger.isDebugEnabled()) {
            logger.logSingle(
              `${config.targetGenerator}: ${E.isRight(result) ? 'success' : 'failure'}`,
              E.isRight(result) ? 'green' : 'red',
            );
          }

          parseResult(result, config);
        }

        printFailuresAtEnd();
        printDebugSummary();

        if (aggregatedFailures.length > 0) {
          process.exitCode = 1;
        }
      })(maybeConfigs);
    })
    .catch(catchUnexpectedError);
}

main();
