import { SettingsConfig } from '../core/settings';

/**
 * Builder class to create SettingsConfig objects.
 * For testing purposes only.
 */
export class SettingsBuilder {
  build(): SettingsConfig {
    return {
      sourceDirectory: './',
      scope: [],
      outputDir: './',
      targetGenerator: 'openapi',
      indexOnly: false,
      defaultGroupName: 'Misc',
      openApiTitle: 'Apex API',
      openApiFileName: 'openapi',
      includeMetadata: false,
    };
  }
}
