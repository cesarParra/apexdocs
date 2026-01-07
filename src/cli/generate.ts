#!/usr/bin/env node
import { Apexdocs } from '../application/Apexdocs';
import { extractArgs } from './args';
import { StdOutLogger } from '#utils/logger';
import * as E from 'fp-ts/Either';
import { UserDefinedConfig } from '../core/shared/types';
import { createReflectionDebugLogger } from '#utils/reflection-debug-logger';
import { ErrorCollector } from '#utils/error-collector';

function isDebugEnabledFromProcessArgs(): boolean {
  return process.argv.includes('--debug');
}

const logger = new StdOutLogger();
logger.setDebug(isDebugEnabledFromProcessArgs());

function main() {
  function printFailuresAtEnd(collector: ErrorCollector, config: UserDefinedConfig) {
    if (!collector.hasErrors()) {
      return;
    }

    const count = collector.count();
    logger.logSingle(`⚠️ ${config.targetGenerator}: ${count} error(s) occurred. Please review the following:`, 'red');

    for (const item of collector.all()) {
      logger.error(ErrorCollector.format(item));
    }
  }

  function catchUnexpectedError(error: Error | unknown) {
    logger.error(`❌ An error occurred while processing the request: ${error}`);
    process.exit(1);
  }

  function printResultMessage(result: E.Either<unknown, string>) {
    if (E.isRight(result)) {
      logger.logSingle('Documentation generated successfully');
    }
  }

  extractArgs()
    .then(async (maybeConfigs) => {
      E.match(catchUnexpectedError, async (configs: readonly UserDefinedConfig[]) => {
        for (const config of configs) {
          const errorCollector = new ErrorCollector(config.targetGenerator);

          const reflectionDebugLogger = createReflectionDebugLogger(logger, (filePath, errorMessage) => {
            errorCollector.addFailure('other', filePath, errorMessage);
          });

          if (logger.isDebugEnabled()) {
            logger.debug(`Currently processing generator: ${config.targetGenerator}`);
          }

          const result = await Apexdocs.generate(config, {
            logger,
            reflectionDebugLogger,
            errorCollector,
          });

          if (logger.isDebugEnabled()) {
            logger.logSingle(
              `${config.targetGenerator}: ${E.isRight(result) ? 'success' : 'failure'}`,
              E.isRight(result) ? 'green' : 'red',
            );
          }

          printFailuresAtEnd(errorCollector, config);

          if (errorCollector.hasErrors()) {
            process.exitCode = 1;
          }

          printResultMessage(result);
        }
      })(maybeConfigs);
    })
    .catch(catchUnexpectedError);
}

main();
