import { SetOptional } from 'type-fest';
import { type ConfigurationHooks, UserDefinedMarkdownConfig } from './core/shared/types';
import { defaults } from './defaults';

type ConfigurableMarkdownConfig = Omit<
  SetOptional<UserDefinedMarkdownConfig, 'targetDir' | 'scope' | 'defaultGroupName' | 'includeMetadata'>,
  'targetGenerator' | 'referenceGuideTemplate'
>;

function defineMarkdownConfig(config: ConfigurableMarkdownConfig): UserDefinedMarkdownConfig {
  return {
    ...defaults,
    ...config,
    targetGenerator: 'markdown',
  };
}

// Exports

export { defineMarkdownConfig, ConfigurationHooks };
