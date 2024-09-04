import { cosmiconfig, CosmiconfigResult } from 'cosmiconfig';
import * as yargs from 'yargs';
import { UserDefinedConfig, UserDefinedMarkdownConfig } from '../core/shared/types';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import { markdownOptions } from './commands/markdown';
import { openApiOptions } from './commands/openapi';

const configOnlyDefaults: Partial<UserDefinedMarkdownConfig> = {
  excludeTags: [],
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

  const mergedConfig = { ...config?.config, ...cliArgs, targetGenerator: commandName as 'markdown' | 'openapi' };
  if (mergedConfig.targetGenerator === 'markdown') {
    return { ...configOnlyDefaults, ...mergedConfig };
  } else {
    return mergedConfig;
  }
}
