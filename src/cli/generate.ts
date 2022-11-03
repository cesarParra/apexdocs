#!/usr/bin/env node
import * as yargs from 'yargs';

import { GeneratorChoices, Settings } from '../settings';
import { Apexdocs } from '../application/Apexdocs';

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
    default: ['global'],
    describe:
      'A list of scopes to document. Values should be separated by a space, e.g --scope global public namespaceaccessible. ' +
      'Annotations are supported and should be passed lowercased and without the @ symbol, e.g. namespaceaccessible auraenabled. ' +
      'Note that this setting is ignored if generating an OpenApi REST specification since that looks for classes annotated with @RestResource.',
  },
  targetGenerator: {
    type: 'string',
    alias: 'g',
    default: 'jekyll',
    choices: ['jekyll', 'docsify', 'plain-markdown', 'openapi'],
    describe:
      'Define the static file generator for which the documents will be created. ' +
      'Currently supports jekyll, docsify, plain markdown, and OpenAPI v3.1.0.',
  },
  indexOnly: {
    type: 'boolean',
    default: false,
    describe: 'Defines whether only the index file should be generated.',
  },
  defaultGroupName: {
    type: 'string',
    default: 'Miscellaneous',
    describe: 'Defines the @group name to be used when a file does not specify it.',
  },
  sanitizeHtml: {
    type: 'boolean',
    default: true,
    describe:
      'When on, any special character within your ApexDocs is converted into its HTML code representation. ' +
      'This is specially useful when generic objects are described within the docs, e.g. "List< Foo>", "Map<Foo, Bar>" ' +
      'because otherwise the content within < and > would be treated as HTML tags and not shown in the output. ' +
      'Content in @example blocks are never sanitized.',
  },
  openApiTitle: {
    type: 'string',
    default: 'Apex REST Api',
    describe: 'If using "openapi" as the target generator, this allows you to specify the OpenApi title value.',
  },
}).argv;

Settings.build({
  sourceDirectory: argv.sourceDir,
  recursive: argv.recursive,
  scope: argv.scope,
  outputDir: argv.targetDir,
  targetGenerator: argv.targetGenerator as GeneratorChoices,
  indexOnly: argv.indexOnly,
  defaultGroupName: argv.defaultGroupName,
  sanitizeHtml: argv.sanitizeHtml,
  openApiTitle: argv.openApiTitle,
});

Apexdocs.generate();
