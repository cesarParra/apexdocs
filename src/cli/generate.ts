#!/usr/bin/env node
import { Apexdocs } from '../application/Apexdocs';
import { extractArgs } from './args';

function main() {
  function cathError(error: Error) {
    console.error(error);
    process.exit(1);
  }

  extractArgs()
    .then((config) => Apexdocs.generate(config).catch(cathError))
    .catch(cathError);
}

main();
