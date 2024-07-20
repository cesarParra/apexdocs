#!/usr/bin/env node
import { Apexdocs } from '../application/Apexdocs';
import { extractArgs } from './args';

function main() {
  extractArgs()
    .then((config) => {
      Apexdocs.generate(config);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

main();
