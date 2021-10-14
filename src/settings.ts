import DocsProcessor from './processor/docs-processor';
import JekyllDocsProcessor from './processor/jekyll/jekyll-docsProcessor';
import DocsifyDocsProcessor from './processor/docsify/docsify-docs-processor';
import AsJsDocsProcessor from './processor/jsdoc/as-js-docs-processor';

export type GeneratorChoices = 'jekyll' | 'docsify' | 'jsdocs';

export interface SettingsConfig {
  sourceDirectory: string;
  recursive: boolean;
  scope: string[];
  outputDir: string;
  targetGenerator: GeneratorChoices;
  configPath?: string;
  group?: boolean;
}

export class Settings {
  private static instance: Settings;

  private constructor(public config: SettingsConfig) {}

  public static build(config: SettingsConfig) {
    Settings.instance = new Settings(config);
  }

  public static getInstance(): Settings {
    if (!Settings.instance) {
      throw new Error('Settings has not been initialized');
    }
    return Settings.instance;
  }

  get sourceDirectory(): string {
    return this.config.sourceDirectory;
  }

  get recursive(): boolean {
    return this.config.recursive;
  }

  get scope(): string[] {
    return this.config.scope;
  }

  get outputDir(): string {
    return this.config.outputDir;
  }

  get docsProcessor(): DocsProcessor {
    switch (this.config.targetGenerator) {
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
    return this.config.configPath;
  }

  get shouldGroup(): boolean | undefined {
    return this.config.group;
  }
}
