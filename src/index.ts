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
  UserDefinedChangelogConfig,
} from './core/shared/types';
import { changeLogDefaults, markdownDefaults, openApiDefaults } from './defaults';
import { process } from './node/process';

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

type ConfigurableChangelogConfig = Omit<Partial<UserDefinedChangelogConfig>, 'targetGenerator'>;

/**
 * Helper function to define a configuration to generate a changelog.
 * @param config The configuration to use.
 */
function defineChangelogConfig(config: ConfigurableChangelogConfig): Partial<UserDefinedChangelogConfig> {
  return {
    ...changeLogDefaults,
    ...config,
    targetGenerator: 'changelog' as const,
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

export {
  defineMarkdownConfig,
  ConfigurableMarkdownConfig,
  defineOpenApiConfig,
  ConfigurableOpenApiConfig,
  defineChangelogConfig,
  ConfigurableChangelogConfig,
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
