#!/usr/bin/env node
import * as yargs from 'yargs';

import FileManager from '../service/file-manager';
import { GeneratorChoices, Settings } from '../Settings';
import { createManifest } from '../service/manifest-factory';
import { Logger } from '../util/logger';
import { RawBodyParser } from '../service/parser';
import { ApexFileReader } from '../service/apex-file-reader';

const argv = yargs.options({
  sourceDir: {
    type: 'string',
    alias: 's',
    demandOption: true,
    describe: 'The directory location which contains your apex .cls classes.',
  },
  targetDir: {
    type: 'string',
    alias: 't',
    default: './docs/',
    describe: 'The directory location where documentation will be generated to.',
  },
  recursive: {
    type: 'boolean',
    alias: 'r',
    default: true,
    describe: 'Whether .cls classes will be searched for recursively in the directory provided.',
  },
  scope: {
    type: 'array',
    alias: 'p',
    default: ['global', 'public', 'namespaceaccessible'],
    describe: 'A list of scopes to document. Values should be separated by a space, e.g --scope public private.',
  },
  targetGenerator: {
    type: 'string',
    alias: 'g',
    default: 'jekyll',
    choices: ['jekyll', 'docsify', 'jsdoc'],
    describe:
      'Define the static file generator for which the documents will be created. Currently supports jekyll, docsify, and jsdoc.',
  },
  configPath: {
    type: 'string',
    alias: 'c',
    describe: 'The path to the JSON configuration file that defines the structure of the documents to generate.',
  },
  group: {
    type: 'boolean',
    alias: 'o',
    default: true,
    describe:
      'Define whether the generated files should be grouped by the @group tag on the top level classes.' +
      'If set to true, a sub directory will be created per group inside of the specified target directory.',
  },
}).argv;

Settings.build({
  sourceDirectory: argv.sourceDir,
  recursive: argv.recursive,
  scope: argv.scope,
  outputDir: argv.targetDir,
  targetGenerator: argv.targetGenerator as GeneratorChoices,
  configPath: argv.configPath,
  group: argv.group,
});

const fileBodies = new ApexFileReader().processFiles();
const manifest = createManifest(new RawBodyParser(fileBodies));
Logger.log(`Parsed ${manifest.types.length} files`);
FileManager.generate(manifest.types);
