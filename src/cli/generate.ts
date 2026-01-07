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
  let commandsRun = 0;

  function printFailuresAtEnd(collector: ErrorCollector, config: UserDefinedConfig) {
    if (!collector.hasErrors()) {
      return;
    }

    // Source of truth: the per-generator error collector
    const count = collector.count();
    logger.logSingle(
      `⚠️ ${config.targetGenerator}: ${count} error item(s) occurred. Please review the following:`,
      'red',
    );

    for (const item of collector.all()) {
      logger.error(ErrorCollector.format(item));
    }
  }

  function printDebugSummary(collector: ErrorCollector) {
    if (!logger.isDebugEnabled()) {
      return;
    }

    logger.debug(`commandsRun=${commandsRun}`);
    logger.debug(`aggregatedFailures=${collector.count()}`);
  }

  function catchUnexpectedError(error: Error | unknown) {
    logger.error(`❌ An error occurred while processing the request: ${error}`);
    process.exit(1);
  }

  function printResultMessage(result: E.Either<unknown, string>) {
    // Keep CLI output stable for integrations/tests that assert on this message.
    // We intentionally do not rely on returned error shapes for details; the ErrorCollector is the source of truth.
    if (E.isRight(result)) {
      logger.logSingle('Documentation generated successfully');
    }
  }

  extractArgs()
    .then(async (maybeConfigs) => {
      E.match(catchUnexpectedError, async (configs: readonly UserDefinedConfig[]) => {
        for (const config of configs) {
          commandsRun++;

          const errorCollector = new ErrorCollector(config.targetGenerator);

          const reflectionDebugLogger = createReflectionDebugLogger(logger, (filePath, errorMessage) => {
            // We treat reflection parsing failures as "other" here because the callback doesn't
            // provide component-type context. Parsers still log stage-specific failures where available.
            errorCollector.addFailure('other', filePath, errorMessage);
          });

          if (logger.isDebugEnabled()) {
            logger.debug(`Currently processing generator: ${config.targetGenerator}`);
          }

          // Failure details are tracked via the collector; the return value now only indicates success/failure.
          const result = await Apexdocs.generate(config, {
            logger,
            reflectionDebugLogger,
            errorCollector,
          });

          // Preserve the historical success message expected by integration tests.
          printResultMessage(result);

          if (logger.isDebugEnabled()) {
            logger.logSingle(
              `${config.targetGenerator}: ${E.isRight(result) ? 'success' : 'failure'}`,
              E.isRight(result) ? 'green' : 'red',
            );
          }

          // End-of-run reporting per generator
          printFailuresAtEnd(errorCollector, config);
          printDebugSummary(errorCollector);

          if (errorCollector.hasErrors()) {
            process.exitCode = 1;
          }
        }
      })(maybeConfigs);
    })
    .catch(catchUnexpectedError);
}

main();
