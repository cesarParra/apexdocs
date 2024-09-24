import { cosmiconfig, CosmiconfigResult } from 'cosmiconfig';
import * as yargs from 'yargs';
import { Generators, UserDefinedConfig, UserDefinedMarkdownConfig } from '../core/shared/types';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import { markdownOptions } from './commands/markdown';
import { openApiOptions } from './commands/openapi';
import { changeLogOptions } from './commands/changelog';

const configOnlyMarkdownDefaults: Partial<UserDefinedMarkdownConfig> = {
  excludeTags: [],
  exclude: [],
};

const configOnlyOpenApiDefaults = {
  exclude: [],
};

/**
 * Extracts configuration from a configuration file or the package.json
 * through cosmiconfig.
 */
function _extractConfig(): Promise<CosmiconfigResult> {
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
      yargs.options(markdownOptions),
    )
    .command('openapi', 'Generate an OpenApi REST specification from Apex classes.', () =>
      yargs.options(openApiOptions),
    )
    .command('changelog', 'Generate a changelog from 2 versions of the source code.', () =>
      yargs.options(changeLogOptions),
    )
    .demandCommand()
    .parseSync();
}

/**
 * Combines the extracted configuration and arguments.
 */
export async function extractArgs(): Promise<UserDefinedConfig> {
  const config = await _extractConfig();
  const cliArgs = _extractYargs(config);
  const commandName = cliArgs._[0];

  const mergedConfig = { ...config?.config, ...cliArgs, targetGenerator: commandName as Generators };

  // TODO: It should be possible to have a version of the config that supports
  // generating all commands at the same time. So users should be able to provide the key for the main
  // command, and then it should be possible to provide the specific configuration for each command.
  // this is invaluable if we want to allow for the combination of changelog + markdown generation, for example

  switch (mergedConfig.targetGenerator) {
    case 'markdown':
      return { ...configOnlyMarkdownDefaults, ...mergedConfig };
    case 'openapi':
      return { ...configOnlyOpenApiDefaults, ...mergedConfig };
    case 'changelog':
      return mergedConfig;
    default:
      throw new Error(`Unknown command: ${commandName}`);
  }
}
