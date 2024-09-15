#!/usr/bin/env node
import { Apexdocs } from '../application/Apexdocs';
import { extractArgs } from './args';
import { StdOutLogger } from '#utils/logger';
import * as E from 'fp-ts/Either';

const logger = new StdOutLogger();

function main() {
  function parseResult(result: E.Either<unknown, string>) {
    E.match(
      (error) => {
        logger.error(`❌ An error occurred while generating the documentation: ${error}`);
        process.exit(1);
      },
      (successMessage: string) => {
        logger.logSingle(successMessage);
      },
    )(result);
  }

  function catchUnexpectedError(error: Error) {
    logger.error(`❌ An unexpected error occurred: ${error.message}`);
    process.exit(1);
  }

  extractArgs()
    .then((config) => Apexdocs.generate(config, logger).then(parseResult))
    .catch(catchUnexpectedError);
}

main();
