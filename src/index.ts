import type {
  ConfigurableHooks,
  Skip,
  UserDefinedMarkdownConfig,
  ReferenceGuidePageData,
  DocPageData,
  DocPageReference,
  ConfigurableDocPageData,
  TransformReferenceGuide,
  TransformDocs,
  TransformDocPage,
  TransformReference,
  ConfigurableDocPageReference,
  UserDefinedOpenApiConfig,
  UserDefinedConfig,
} from './core/shared/types';
import { markdownDefaults, openApiDefaults } from './defaults';
import { NoLogger } from '#utils/logger';
import { Apexdocs } from './application/Apexdocs';
import * as E from 'fp-ts/Either';

type ConfigurableMarkdownConfig = Omit<Partial<UserDefinedMarkdownConfig>, 'targetGenerator'>;

/**
 * Helper function to define a configuration to generate Markdown documentation.
 * @param config The configuration to use.
 */
function defineMarkdownConfig(config: ConfigurableMarkdownConfig): Partial<UserDefinedMarkdownConfig> {
  return {
    ...markdownDefaults,
    ...config,
    targetGenerator: 'markdown' as const,
  };
}

type ConfigurableOpenApiConfig = Omit<Partial<UserDefinedOpenApiConfig>, 'targetGenerator'>;

/**
 * Helper function to define a configuration to generate OpenAPI documentation.
 * @param config The configuration to use.
 */
function defineOpenApiConfig(config: ConfigurableOpenApiConfig): Partial<UserDefinedOpenApiConfig> {
  return {
    ...openApiDefaults,
    ...config,
    targetGenerator: 'openapi' as const,
  };
}

/**
 * Represents a file to be skipped.
 */
function skip(): Skip {
  return {
    _tag: 'Skip',
  };
}

type CallableConfig = Partial<UserDefinedConfig> & { sourceDir: string; targetGenerator: 'markdown' | 'openapi' };

// TODO: Docs
async function process(config: CallableConfig): Promise<void> {
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

export {
  defineMarkdownConfig,
  ConfigurableMarkdownConfig,
  defineOpenApiConfig,
  ConfigurableOpenApiConfig,
  skip,
  TransformReferenceGuide,
  TransformDocs,
  TransformDocPage,
  TransformReference,
  ConfigurableHooks,
  ReferenceGuidePageData,
  DocPageData,
  DocPageReference,
  Skip,
  ConfigurableDocPageData,
  ConfigurableDocPageReference,
  process,
};
