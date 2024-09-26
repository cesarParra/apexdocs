import { cosmiconfig, CosmiconfigResult } from 'cosmiconfig';
import * as yargs from 'yargs';
import * as E from 'fp-ts/Either';
import { Generators, UserDefinedConfig, UserDefinedMarkdownConfig } from '../core/shared/types';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import { markdownOptions } from './commands/markdown';
import { openApiOptions } from './commands/openapi';
import { changeLogOptions } from './commands/changelog';
import { pipe } from 'fp-ts/function';

const configOnlyMarkdownDefaults: Partial<UserDefinedMarkdownConfig> = {
  excludeTags: [],
  exclude: [],
};

const configOnlyOpenApiDefaults = {
  exclude: [],
};

/**
 * Combines the extracted configuration and arguments.
 */
export async function extractArgs(): Promise<E.Either<Error, readonly UserDefinedConfig[]>> {
  const config = await extractConfig();
  const configType = getConfigType(config);

  switch (configType._type) {
    case 'no-config':
    case 'single-command-config':
      return handleSingleCommand(config);
    case 'multi-command-config':
      return extractArgsForCommandsProvidedInConfig(config!.config);
  }
}

/**
 * Extracts configuration from a configuration file or the package.json
 * through cosmiconfig.
 */
function extractConfig(): Promise<CosmiconfigResult> {
  return cosmiconfig('apexdocs', {
    loaders: {
      '.ts': TypeScriptLoader(),
    },
  }).search();
}

function handleSingleCommand(config: CosmiconfigResult) {
  return pipe(
    E.right(config),
    E.flatMap(extractArgsForCommandProvidedThroughCli),
    E.map((config) => [config]),
  );
}

function extractArgsForCommandProvidedThroughCli(config: CosmiconfigResult): E.Either<Error, UserDefinedConfig> {
  const cliArgs = extractYargsDemandingCommand(config);
  const commandName = cliArgs._[0];

  const mergedConfig = { ...config?.config, ...cliArgs, targetGenerator: commandName as Generators };

  switch (mergedConfig.targetGenerator) {
    case 'markdown':
      return E.right({ ...configOnlyMarkdownDefaults, ...mergedConfig });
    case 'openapi':
      return E.right({ ...configOnlyOpenApiDefaults, ...mergedConfig });
    case 'changelog':
      return E.right(mergedConfig);
    default:
      throw E.left(new Error(`Invalid command provided: ${mergedConfig.targetGenerator}`));
  }
}

type ConfigByGenerator = {
  [key in Generators]: UserDefinedConfig;
};

function extractArgsForCommandsProvidedInConfig(config: ConfigByGenerator) {
  // TODO: Error if a command was still passed through the CLI
  const configs = Object.entries(config).map(([generator, generatorConfig]) => {
    switch (generator as Generators) {
      case 'markdown':
        return pipe(
          validateConfig('markdown', generatorConfig),
          E.map(() => ({ ...configOnlyMarkdownDefaults, ...generatorConfig })),
        );
      case 'openapi':
        return pipe(
          validateConfig('openapi', generatorConfig),
          E.map(() => ({ ...configOnlyOpenApiDefaults, ...generatorConfig })),
        );
      case 'changelog':
        return pipe(
          validateConfig('changelog', generatorConfig),
          E.map(() => generatorConfig),
        );
    }
  });

  return E.sequenceArray(configs);
}

type NoConfig = {
  _type: 'no-config';
};
type SingleCommandConfig = {
  _type: 'single-command-config';
};
type MultiCommandConfig = {
  _type: 'multi-command-config';
  commands: Generators[];
};

function getConfigType(config: CosmiconfigResult): NoConfig | SingleCommandConfig | MultiCommandConfig {
  if (!config) {
    return { _type: 'no-config' };
  }

  // When the config has a shape that looks as follows:
  // Partial<{
  //   COMMAND_NAME: ...,
  //   ANOTHER_COMMAND_NAME: ...,
  // }>
  // That means that the config is providing the name of the command, and the user is not
  // expected to provide it through the CLI.
  // We call this a "multi-command-config", as it allows for the config file to provide
  // configuration for multiple commands at the same time.
  const rootKeys = Object.keys(config.config);
  const validRootKeys = ['markdown', 'openapi', 'changelog'];
  const containsAnyValidRootKey = rootKeys.some((key) => validRootKeys.includes(key));
  if (containsAnyValidRootKey) {
    const commands = rootKeys.filter((key) => validRootKeys.includes(key));
    const hasInvalidCommands = rootKeys.some((key) => !validRootKeys.includes(key));
    if (hasInvalidCommands) {
      throw new Error(`Invalid command(s) provided in the configuration file: ${rootKeys}`);
    }

    return {
      _type: 'multi-command-config',
      // TODO: Throw if the same root key is provided more than once
      commands: commands as Generators[],
    };
  }

  return { _type: 'single-command-config' };
}

/**
 * Extracts arguments from the command line, expecting a command to be provided.
 * @param config The configuration object from the configuration file, if any.
 */
function extractYargsDemandingCommand(config?: CosmiconfigResult) {
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

function validateConfig(command: Generators, config: UserDefinedConfig) {
  function getOptions(generator: Generators) {
    switch (generator) {
      case 'markdown':
        return markdownOptions;
      case 'openapi':
        return openApiOptions;
      case 'changelog':
        return changeLogOptions;
    }
  }

  const options = getOptions(command);
  return E.tryCatch(() => {
    yargs
      .config(config)
      .options(options)
      .fail((msg) => {
        throw new Error(`Invalid configuration for command "${command}": ${msg}`);
      })
      .parse();
  }, E.toError);
}
