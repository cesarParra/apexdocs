import DocsProcessor from './DocsProcessor';
import JekyllDocsProcessor from './JekyllDocsProcessor';
import DocsifyDocsProcessor from './DocsifyDocsProcessor';
import AsJsDocsProcessor from './AsJsDocsProcessor';

export type GeneratorChoices = 'jekyll' | 'docsify' | 'jsdocs';

export interface SettingsConfig {
  sourceDirectory: string,
  recursive: boolean,
  scope: string[],
  outputDir: string,
  targetGenerator: GeneratorChoices,
  configPath?: string,
  group?: boolean
}

export class Settings {
  private static instance: Settings;

  _config!: SettingsConfig;

  static build(config: SettingsConfig) {
    Settings.instance = new Settings();
    Settings.instance._config = config;
  }

  static getInstance(): Settings {
    return Settings.instance;
  }

  get sourceDirectory(): string {
    return this._config.sourceDirectory;
  }

  get recursive(): boolean {
    return this._config.recursive;
  }

  get scope(): string[] {
    return this._config.scope;
  }

  get outputDir(): string {
    return this._config.outputDir;
  }

  get docsProcessor(): DocsProcessor {
    switch (this._config.targetGenerator) {
      case 'jekyll':
        return new JekyllDocsProcessor();
      case 'docsify':
        return new DocsifyDocsProcessor();
      case 'jsdocs':
        return new AsJsDocsProcessor();
      default:
        throw Error('Invalid target generator');
    }
  }

  get configPath(): string | undefined {
    return this._config.configPath;
  }

  get shouldGroup(): boolean | undefined {
    return this._config.group;
  }
}
