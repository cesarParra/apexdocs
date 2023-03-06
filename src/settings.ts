import { GeneratorChoices } from './transpiler/generator-choices';

export interface SettingsConfig {
  sourceDirectory: string;
  recursive: boolean;
  scope: string[];
  outputDir: string;
  targetGenerator: GeneratorChoices;
  indexOnly: boolean;
  defaultGroupName: string;
  sanitizeHtml: boolean;
  openApiTitle?: string;
  title: string;
  namespace?: string;
  openApiFileName: string;
  includeMetadata: boolean;
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

  get targetGenerator(): GeneratorChoices {
    return this.config.targetGenerator;
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

  public getOpenApiTitle(): string | undefined {
    return this.config.openApiTitle ?? this.config.title;
  }

  public getTitle(): string {
    return this.config.title;
  }

  public getNamespace(): string | undefined {
    return this.config.namespace;
  }

  public getNamespacePrefix(): string {
    if (!this.config.namespace) {
      return '';
    }
    return `${this.config.namespace}.`;
  }

  public openApiFileName(): string {
    return this.config.openApiFileName;
  }

  public includeMetadata(): boolean {
    return this.config.includeMetadata;
  }
}
