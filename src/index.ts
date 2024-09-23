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
} from './core/shared/types';
import { markdownDefaults, openApiDefaults } from './defaults';
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

/**
 * Represents a file to be skipped.
 */
function skip(): Skip {
  return {
    _tag: 'Skip',
  };
}

// TODO: It should be possible to generate the changelog imperatively

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
