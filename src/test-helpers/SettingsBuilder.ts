import { SettingsConfig } from '../settings';

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
      title: 'Classes',
      includeMetadata: false,
      linkingStrategy: 'root-relative',
    };
  }
}
