import { SetOptional } from 'type-fest';
import { type ConfigurableHooks, UserDefinedMarkdownConfig } from './core/shared/types';
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

// Exports

export { defineMarkdownConfig, ConfigurableHooks };
