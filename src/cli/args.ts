import { cosmiconfig, CosmiconfigResult } from 'cosmiconfig';
import * as yargs from 'yargs';
import { UserDefinedMarkdownConfig } from '../core/shared/types';
import { defaults } from '../defaults';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';

/**
 * Extracts configuration from a configuration file or the package.json
 * through cosmiconfig.
 */
function _extractConfig(): Promise<CosmiconfigResult> {
  // TODO: Test and confirm that we can also work with JS files
  return cosmiconfig('apexdocs', {
    loaders: {
      '.ts': TypeScriptLoader(),
    },
  }).search();
}

/**
 * Extracts arguments from the command line.
 * @param config The configuration object from the configuration file, if any.
 */
function _extractYargs(config?: CosmiconfigResult) {
  return yargs
    .config(config?.config)
    .command('markdown', 'Generate documentation from Apex classes as a Markdown site.', (yargs) =>
      yargs.options({
        sourceDir: {
          type: 'string',
          alias: 's',
          demandOption: true,
          describe: 'The directory location which contains your apex .cls classes.',
        },
        targetDir: {
          type: 'string',
          alias: 't',
          default: defaults.targetDir,
          describe: 'The directory location where documentation will be generated to.',
        },
        scope: {
          type: 'string',
          array: true,
          alias: 'p',
          default: defaults.scope,
          describe:
            'A list of scopes to document. Values should be separated by a space, e.g --scope global public namespaceaccessible. ' +
            'Annotations are supported and should be passed lowercased and without the @ symbol, e.g. namespaceaccessible auraenabled. ' +
            'Note that this setting is ignored if generating an OpenApi REST specification since that looks for classes annotated with @RestResource.',
        },
        defaultGroupName: {
          type: 'string',
          default: defaults.defaultGroupName,
          describe: 'Defines the @group name to be used when a file does not specify it.',
        },
        openApiTitle: {
          type: 'string',
          default: 'Apex REST Api',
          describe: 'If using "openapi" as the target generator, this allows you to specify the OpenApi title value.',
        },
        namespace: {
          type: 'string',
          describe:
            'The package namespace, if any. If this value is provided the namespace will be added as a prefix to all of the parsed files. ' +
            "If generating an OpenApi definition, it will be added to the file's Server Url.",
        },
        openApiFileName: {
          type: 'string',
          describe:
            'If using "openapi" as the target generator, this allows you to specify the name of the output file.',
          default: 'openapi',
        },
        // TODO: Make sure this is being respected
        sortMembersAlphabetically: {
          type: 'boolean',
          describe: 'Whether to sort members alphabetically.',
          default: false,
        },
        includeMetadata: {
          type: 'boolean',
          describe: "Whether to include the file's meta.xml information: Whether it is active and and the API version",
          default: defaults.includeMetadata,
        },
      }),
    )
    .command('openapi', 'Generate an OpenApi REST specification from Apex classes.') // TODO: Implement OpenApi the same way
    .demandCommand()
    .parseSync();
}

/**
 * Combines the extracted configuration and arguments.
 */
export async function extractArgs(): Promise<UserDefinedMarkdownConfig> {
  const config = await _extractConfig();
  const cliArgs = _extractYargs(config);
  const commandName = cliArgs._[0];

  return { ...config?.config, ...cliArgs, targetGenerator: commandName as 'markdown' | 'openapi' };
}
