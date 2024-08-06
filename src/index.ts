import { SetOptional } from 'type-fest';
import { type ConfigurableHooks, Skip, UserDefinedMarkdownConfig } from './core/shared/types';
import { defaults } from './defaults';

type ConfigurableMarkdownConfig = Omit<
  SetOptional<
    UserDefinedMarkdownConfig,
    'targetDir' | 'scope' | 'defaultGroupName' | 'includeMetadata' | 'sortMembersAlphabetically'
  >,
  'targetGenerator'
>;

function defineMarkdownConfig(config: ConfigurableMarkdownConfig): UserDefinedMarkdownConfig {
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

export { defineMarkdownConfig, skip, ConfigurableHooks };
