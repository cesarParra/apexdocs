#!/usr/bin/env node
import * as yargs from 'yargs';

import Transpiler from '../transpiler/transpiler';
import { GeneratorChoices, Settings } from '../settings';
import { createManifest } from '../service/manifest-factory';
import { Logger } from '../util/logger';
import { RawBodyParser } from '../service/parser';
import { ApexFileReader } from '../service/apex-file-reader';
import { reflect } from '@cparra/apex-reflection';
import { DefaultFileSystem } from '../service/file-system';
import { FileWriter } from '../service/file-writer';
import { ReflectionResult } from '@cparra/apex-reflection/index';

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
  targetGenerator: {
    type: 'string',
    alias: 'g',
    default: 'jekyll',
    choices: ['jekyll', 'docsify'],
    describe:
      'Define the static file generator for which the documents will be created. Currently supports jekyll, and docsify.',
  },
}).argv;

Settings.build({
  sourceDirectory: argv.sourceDir,
  recursive: argv.recursive,
  outputDir: argv.targetDir,
  targetGenerator: argv.targetGenerator as GeneratorChoices,
});

const fileBodies = ApexFileReader.processFiles(new DefaultFileSystem());
const reflectionWithLogger = (declarationBody: string): ReflectionResult => {
  const result = reflect(declarationBody);
  if (result.error) {
    Logger.log(`Parsing error ${result.error?.message}`);
  }
  return result;
};
const manifest = createManifest(new RawBodyParser(fileBodies), reflectionWithLogger);
Logger.log(`Parsed ${manifest.types.length} files`);
const processor = Settings.getInstance().typeTranspiler;
Transpiler.generate(manifest.types, processor);
const generatedFiles = processor.fileBuilder().files();
FileWriter.write(generatedFiles, (fileName: string) => {
  Logger.log(`${fileName} processed.`);
});
