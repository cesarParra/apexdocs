#!/usr/bin/env node
import { Apexdocs } from '../application/Apexdocs';
import { extractArgs } from './args';
import { StdOutLogger } from '#utils/logger';
import * as E from 'fp-ts/Either';
import { UserDefinedConfig } from '../core/shared/types';

const logger = new StdOutLogger();

function main() {
  function parseResult(result: E.Either<unknown, string>) {
    E.match(catchUnexpectedError, (successMessage: string) => {
      logger.logSingle(successMessage);
    })(result);
  }

  function catchUnexpectedError(error: Error | unknown) {
    logger.error(`❌ An error occurred while processing the request: ${error}`);
    process.exit(1);
  }

  extractArgs()
    .then(async (maybeConfigs) => {
      E.match(catchUnexpectedError, async (configs: readonly UserDefinedConfig[]) => {
        for (const config of configs) {
          await Apexdocs.generate(config, logger).then(parseResult);
        }
      })(maybeConfigs);
    })
    .catch(catchUnexpectedError);
}

main();
