import type { UserDefinedConfig } from '../core/shared/types';
import { NoLogger } from '#utils/logger';
import { Apexdocs } from '../application/Apexdocs';
import * as E from 'fp-ts/Either';
import { markdownDefaults, openApiDefaults } from '../defaults';

type CallableConfig = Partial<UserDefinedConfig> & { sourceDir: string; targetGenerator: 'markdown' | 'openapi' };

/**
 * Processes the documentation generation, similar to the main function in the CLI.
 * @param config The configuration to use.
 */
export async function process(config: CallableConfig): Promise<void> {
  const logger = new NoLogger();
  const configWithDefaults = {
    ...getDefault(config),
    ...config,
  };

  if (!configWithDefaults.sourceDir) {
    throw new Error('sourceDir is required');
  }

  const result = await Apexdocs.generate(configWithDefaults as UserDefinedConfig, logger);
  E.match(
    (errors) => {
      throw errors;
    },
    () => {},
  )(result);
}

function getDefault(config: CallableConfig) {
  switch (config.targetGenerator) {
    case 'markdown':
      return markdownDefaults;
    case 'openapi':
      return openApiDefaults;
    default:
      throw new Error('Unknown target generator');
  }
}
