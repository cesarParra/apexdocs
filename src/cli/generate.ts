#!/usr/bin/env node
import { Apexdocs } from '../application/Apexdocs';
import { extractArgs } from './args';
import { Logger } from '#utils/logger';
import * as E from 'fp-ts/Either';

function main() {
  function parseResult(result: E.Either<unknown, string>) {
    E.match(
      (error) => {
        Logger.error(`❌ An error occurred while generating the documentation: ${error}`);
        process.exit(1);
      },
      (successMessage: string) => {
        Logger.logSingle(successMessage);
      },
    )(result);
  }

  function catchUnexpectedError(error: Error) {
    Logger.error(`❌ An unexpected error occurred: ${error.message}`);
    process.exit(1);
  }

  extractArgs()
    .then((config) => Apexdocs.generate(config).then(parseResult))
    .catch(catchUnexpectedError);
}

main();
