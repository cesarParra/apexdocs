import { SettingsConfig } from '../settings';

/**
 * Builder class to create SettingsConfig objects.
 * For testing purposes only.
 */
export class SettingsBuilder {
  build(): SettingsConfig {
    return {
      sourceDirectory: './',
      recursive: true,
      scope: [],
      outputDir: './',
      targetGenerator: 'openapi',
      indexOnly: false,
      defaultGroupName: 'Misc',
      sanitizeHtml: true,
      openApiTitle: 'Apex API',
    };
  }
}
