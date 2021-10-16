import ProcessorTypeTranspiler from './transpiler/processor-type-transpiler';
import { MarkdownTranspilerBase } from './transpiler/markdown/markdown-transpiler-base';

export type GeneratorChoices = 'jekyll' | 'docsify';

export interface SettingsConfig {
  sourceDirectory: string;
  recursive: boolean;
  outputDir: string;
  targetGenerator: GeneratorChoices;
}

export class Settings {
  private static instance: Settings;

  private constructor(public config: SettingsConfig) {
  }

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

  get outputDir(): string {
    return this.config.outputDir;
  }

  get typeTranspiler(): ProcessorTypeTranspiler {
    // switch (this.config.targetGenerator) {
    //   case 'jekyll':
    //     return new JekyllDocsProcessor();
    //   case 'docsify':
    //     return new DocsifyDocsProcessor();
    //   case 'jsdocs':
    //     return new AsJsDocsProcessor();
    //   default:
    //     throw Error('Invalid target generator');
    // }
    return new MarkdownTranspilerBase();
  }
}
