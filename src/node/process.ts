import type { Generators, UserDefinedConfig } from '../core/shared/types';
import { NoLogger } from '#utils/logger';
import { Apexdocs } from '../application/Apexdocs';
import * as E from 'fp-ts/Either';
import { changeLogDefaults, markdownDefaults, openApiDefaults } from '../defaults';
import { createReflectionDebugLogger } from '#utils/reflection-debug-logger';
import { ErrorCollector } from '#utils/error-collector';

type CallableConfig = Partial<UserDefinedConfig> & { sourceDir: string; targetGenerator: Generators };

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

  // Group errors by generator run, consistent with CLI behavior.
  const errorCollector = new ErrorCollector(configWithDefaults.targetGenerator);

  const reflectionDebugLogger = createReflectionDebugLogger(logger, (filePath, errorMessage) => {
    errorCollector.addFailure('other', filePath, errorMessage);
  });

  const result = await Apexdocs.generate(configWithDefaults as UserDefinedConfig, {
    logger,
    reflectionDebugLogger,
    errorCollector,
  });

  E.match(
    (errors) => {
      // Do not rely on returned error shapes/details. The ErrorCollector is the source of truth.
      if (errorCollector.hasErrors()) {
        const details = errorCollector.all().map(ErrorCollector.format).join('\n');
        throw new Error(details);
      }
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
    case 'changelog':
      return changeLogDefaults;
    default:
      throw new Error('Unknown target generator');
  }
}
