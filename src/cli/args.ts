import { Settings } from '../settings';
import { cosmiconfig, CosmiconfigResult } from 'cosmiconfig';
import * as yargs from 'yargs';

type OnlyConfigurableThroughFile = {
  onAfterProcess: Settings['onAfterProcess'];
  onBeforeFileWrite: Settings['onBeforeFileWrite'];
  frontMatterHeader: Settings['frontMatterHeader'];
};

type YargsArgs = ReturnType<typeof _extractYargs>;

type ConfigurableThroughFile = YargsArgs & OnlyConfigurableThroughFile;

export type AllConfigurableOptions = Partial<ConfigurableThroughFile> & YargsArgs;

/**
 * Extracts configuration from a configuration file or the package.json
 * through cosmiconfig.
 */
function _extractConfig(): Promise<CosmiconfigResult> {
  return cosmiconfig('apexdocs').search();
}

/**
 * Extracts arguments from the command line.
 * @param config The configuration object from the configuration file, if any.
 */
function _extractYargs(config?: CosmiconfigResult) {
  return yargs
    .config(config?.config)
    .options({
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
        type: 'string',
        array: true,
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
      title: {
        type: 'string',
        describe: "If this allows you to specify the title of the generated documentation's home file.",
        default: 'Classes',
      },
      namespace: {
        type: 'string',
        describe:
          'The package namespace, if any. If this value is provided the namespace will be added as a prefix to all of the parsed files. ' +
          "If generating an OpenApi definition, it will be added to the file's Server Url.",
      },
      openApiFileName: {
        type: 'string',
        describe: 'If using "openapi" as the target generator, this allows you to specify the name of the output file.',
        default: 'openapi',
      },
      sortMembersAlphabetically: {
        type: 'boolean',
        describe: 'Whether to sort members alphabetically.',
        default: false,
      },
      includeMetadata: {
        type: 'boolean',
        describe: "Whether to include the file's meta.xml information: Whether it is active and and the API version",
        default: false,
      },
      documentationRootDir: {
        type: 'string',
        describe:
          'Allows you to specify the root documentation directory where the files are being generated. This can be helpful when embedding the generated docs into an existing site so that the links are generated correctly.',
      },
    })
    .parseSync();
}

/**
 * Combines the extracted configuration and arguments.
 */
export async function extractArgs(): Promise<AllConfigurableOptions> {
  const config = await _extractConfig();
  const cliArgs = _extractYargs(config);
  return { ...config?.config, ...cliArgs };
}