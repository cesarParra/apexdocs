import { cosmiconfig } from 'cosmiconfig';
import yargs = require('yargs');
import * as E from 'fp-ts/Either';
import {
  Generators,
  UserDefinedChangelogConfig,
  UserDefinedConfig,
  UserDefinedMarkdownConfig,
  UserDefinedOpenApiConfig,
} from '../core/shared/types';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import { markdownOptions } from './commands/markdown';
import { openApiOptions } from './commands/openapi';
import { changeLogOptions } from './commands/changelog';
import { pipe } from 'fp-ts/function';

const configOnlyMarkdownDefaults: Partial<UserDefinedMarkdownConfig> = {
  targetGenerator: 'markdown',
  excludeTags: [],
  exclude: [],
};

const configOnlyOpenApiDefaults = {
  targetGenerator: 'openapi',
  exclude: [],
};

const configOnlyChangelogDefaults = {
  targetGenerator: 'changelog',
  exclude: [],
};

type ExtractArgsFromProcess = () => string[];

function getArgumentsFromProcess() {
  return process.argv.slice(2);
}

type ConfigResult = {
  config: Record<string, unknown>;
};
type ExtractConfig = () => Promise<ConfigResult>;

async function extractConfigFromPackageJsonOrFile(): Promise<ConfigResult> {
  const result = await cosmiconfig('apexdocs', {
    loaders: {
      '.ts': TypeScriptLoader(),
    },
  }).search();
  return { config: result?.config ?? {} };
}

/**
 * Combines the extracted configuration and arguments.
 */
export async function extractArgs(
  extractFromProcessFn: ExtractArgsFromProcess = getArgumentsFromProcess,
  extractConfigFn: ExtractConfig = extractConfigFromPackageJsonOrFile,
): Promise<E.Either<Error, readonly UserDefinedConfig[]>> {
  const config = await extractConfigFn();

  function handle(configType: NoConfig | SingleCommandConfig | MultiCommandConfig) {
    switch (configType._type) {
      case 'no-config':
      case 'single-command-config':
        return handleSingleCommand(extractFromProcessFn, config);
      case 'multi-command-config':
        return extractArgsForCommandsProvidedInConfig(extractFromProcessFn, config.config as ConfigByGenerator);
    }
  }

  return pipe(getConfigType(config), E.flatMap(handle));
}

function handleSingleCommand(extractFromProcessFn: ExtractArgsFromProcess, config: ConfigResult) {
  return pipe(
    E.right(config),
    E.flatMap((config) => extractArgsForCommandProvidedThroughCli(extractFromProcessFn, config)),
    E.map((config) => [config]),
  );
}

function extractArgsForCommandProvidedThroughCli(
  extractFromProcessFn: ExtractArgsFromProcess,
  config: ConfigResult,
): E.Either<Error, UserDefinedConfig> {
  const cliArgs = extractYargsDemandingCommand(extractFromProcessFn, config);
  const commandName = cliArgs._[0];

  const mergedConfig = { ...config.config, ...cliArgs, targetGenerator: commandName as Generators };

  switch (mergedConfig.targetGenerator) {
    case 'markdown':
      return E.right({ ...configOnlyMarkdownDefaults, ...mergedConfig } as UserDefinedMarkdownConfig);
    case 'openapi':
      return E.right({ ...configOnlyOpenApiDefaults, ...mergedConfig } as unknown as UserDefinedOpenApiConfig);
    case 'changelog':
      return E.right({ ...configOnlyChangelogDefaults, ...mergedConfig } as unknown as UserDefinedChangelogConfig);
    default:
      return E.left(new Error(`Invalid command provided: ${mergedConfig.targetGenerator}`));
  }
}

type ConfigByGenerator = {
  [key in Generators]: UserDefinedConfig;
};

function extractArgsForCommandsProvidedInConfig(
  extractFromProcessFn: ExtractArgsFromProcess,
  config: ConfigByGenerator,
): E.Either<Error, readonly UserDefinedConfig[]> {
  const providedThroughCli = yargs.parseSync(extractFromProcessFn());
  const hasACommandBeenProvided = providedThroughCli._.length > 0;

  const configs = Object.entries(config)
    // If no specific command was provided through the CLI, we will generate all the commands.
    // Otherwise, we only want to generate the command that was provided.
    .filter(([generator]) => (hasACommandBeenProvided ? providedThroughCli._[0] === generator : true))
    .map(([generator, generatorConfig]) => {
      switch (generator as Generators) {
        case 'markdown':
          return pipe(
            extractMultiCommandConfig(extractFromProcessFn, 'markdown', generatorConfig),
            E.map((cliArgs) => {
              return cliArgs;
            }),
            E.map((cliArgs) => ({ ...configOnlyMarkdownDefaults, ...generatorConfig, ...cliArgs })),
          );
        case 'openapi':
          return pipe(
            extractMultiCommandConfig(extractFromProcessFn, 'openapi', generatorConfig),
            E.map((cliArgs) => ({ ...configOnlyOpenApiDefaults, ...generatorConfig, ...cliArgs })),
          );
        case 'changelog':
          return pipe(
            extractMultiCommandConfig(extractFromProcessFn, 'changelog', generatorConfig),
            E.map((cliArgs) => {
              return cliArgs;
            }),
            E.map((cliArgs) => ({ ...configOnlyChangelogDefaults, ...generatorConfig, ...cliArgs })),
          );
      }
    });

  return E.sequenceArray(configs) as E.Either<Error, readonly UserDefinedConfig[]>;
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

function getConfigType(config: ConfigResult): E.Either<Error, NoConfig | SingleCommandConfig | MultiCommandConfig> {
  if (!config) {
    return E.right({ _type: 'no-config' });
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
      return E.left(new Error(`Invalid command(s) provided in the configuration file: ${rootKeys}`));
    }

    return E.right({
      _type: 'multi-command-config',
      commands: commands as Generators[],
    });
  }

  return E.right({ _type: 'single-command-config' });
}

function extractYargsDemandingCommand(extractFromProcessFn: ExtractArgsFromProcess, config: ConfigResult) {
  return yargs
    .config(config.config as Record<string, unknown>)
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
    .parseSync(extractFromProcessFn());
}

function extractMultiCommandConfig(
  extractFromProcessFn: ExtractArgsFromProcess,
  command: Generators,
  config: UserDefinedConfig,
) {
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
    return yargs(extractFromProcessFn())
      .config(config)
      .options(options)
      .fail((msg) => {
        throw new Error(`Invalid configuration for command "${command}": ${msg}`);
      })
      .parseSync();
  }, E.toError);
}
