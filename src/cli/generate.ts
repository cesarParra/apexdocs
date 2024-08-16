#!/usr/bin/env node
import { Apexdocs } from '../application/Apexdocs';
import { extractArgs } from './args';

function main() {
  function catchError(error: Error) {
    console.error(error);
    process.exit(1);
  }

  extractArgs()
    .then((config) => Apexdocs.generate(config).catch(catchError))
    .catch(catchError);
}

main();
