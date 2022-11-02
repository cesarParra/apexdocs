import ProcessorTypeTranspiler from './transpiler/processor-type-transpiler';
import { JekyllDocsProcessor } from './transpiler/markdown/jekyll/jekyll-docsProcessor';
import DocsifyDocsProcessor from './transpiler/markdown/docsify/docsify-docs-processor';
import { PlainMarkdownDocsProcessor } from './transpiler/markdown/plain-markdown/plain-docsProcessor';
import { OpenApiDocsProcessor } from './transpiler/openapi/open-api-docs-processor';

export type GeneratorChoices = 'jekyll' | 'docsify' | 'plain-markdown' | 'openapi';

export interface SettingsConfig {
  sourceDirectory: string;
  recursive: boolean;
  scope: string[];
  outputDir: string;
  targetGenerator: GeneratorChoices;
  indexOnly: boolean;
  defaultGroupName: string;
  sanitizeHtml: boolean;
  openApiTitle: string;
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

  private static typeTranspilerCache?: ProcessorTypeTranspiler;

  get typeTranspiler(): ProcessorTypeTranspiler {
    if (Settings.typeTranspilerCache) {
      return Settings.typeTranspilerCache;
    }
    switch (this.config.targetGenerator) {
      case 'jekyll':
        Settings.typeTranspilerCache = new JekyllDocsProcessor();
        return Settings.typeTranspilerCache;
      case 'docsify':
        Settings.typeTranspilerCache = new DocsifyDocsProcessor();
        return Settings.typeTranspilerCache;
      case 'plain-markdown':
        Settings.typeTranspilerCache = new PlainMarkdownDocsProcessor();
        return Settings.typeTranspilerCache;
      case 'openapi':
        Settings.typeTranspilerCache = new OpenApiDocsProcessor();
        return Settings.typeTranspilerCache;
      default:
        throw Error('Invalid target generator');
    }
  }

  get indexOnly(): boolean {
    return this.config.indexOnly;
  }

  get sanitizeHtml(): boolean {
    return this.config.sanitizeHtml;
  }

  public getDefaultGroupName(): string {
    return this.config.defaultGroupName;
  }

  public getOpenApiTitle(): string {
    return this.config.openApiTitle;
  }
}
