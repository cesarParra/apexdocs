import { cosmiconfig, CosmiconfigResult } from 'cosmiconfig';
import * as yargs from 'yargs';
import { UserDefinedMarkdownConfig } from '../core/shared/types';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import { markdownOptions } from './commands/markdown';

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
      yargs.options(markdownOptions),
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
