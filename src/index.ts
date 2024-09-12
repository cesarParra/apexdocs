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

type ConfigurableMarkdownConfig = Omit<Partial<UserDefinedMarkdownConfig>, 'targetGenerator'>;

function defineMarkdownConfig(config: ConfigurableMarkdownConfig): Partial<UserDefinedMarkdownConfig> {
  return {
    ...markdownDefaults,
    ...config,
    targetGenerator: 'markdown' as const,
  };
}

type ConfigurableOpenApiConfig = Omit<Partial<UserDefinedOpenApiConfig>, 'targetGenerator'>;

function defineOpenApiConfig(config: ConfigurableOpenApiConfig): Partial<UserDefinedOpenApiConfig> {
  return {
    ...openApiDefaults,
    ...config,
    targetGenerator: 'openapi' as const,
  };
}

function skip(): Skip {
  return {
    _tag: 'Skip',
  };
}

export {
  defineMarkdownConfig,
  defineOpenApiConfig,
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
};
