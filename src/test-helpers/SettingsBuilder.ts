import { SettingsConfig } from '../core/openapi/openApiSettings';

/**
 * Builder class to create SettingsConfig objects.
 * For testing purposes only.
 */
export class SettingsBuilder {
  build(): SettingsConfig {
    return {
      sourceDirectory: './',
      outputDir: './',
      openApiTitle: 'Apex API',
      openApiFileName: 'openapi',
      version: '1.0.0',
    };
  }
}
