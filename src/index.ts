// TODO: Can I get rid of type-fest now that we are not using this?
//import { SetOptional } from 'type-fest';
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
} from './core/shared/types';
import { defaults } from './defaults';

type ConfigurableMarkdownConfig = Omit<Partial<UserDefinedMarkdownConfig>, 'targetGenerator'>;

function defineMarkdownConfig(config: ConfigurableMarkdownConfig): Partial<UserDefinedMarkdownConfig> {
  return {
    ...defaults,
    ...config,
    targetGenerator: 'markdown',
  };
}

function skip(): Skip {
  return {
    _tag: 'Skip',
  };
}

// Exports

export {
  defineMarkdownConfig,
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
