import { Generator } from './shared/types';

export interface SettingsConfig {
  sourceDirectory: string;
  scope: string[];
  outputDir: string;
  targetGenerator: Generator;
  indexOnly: boolean;
  defaultGroupName: string;
  openApiTitle?: string;
  namespace?: string;
  openApiFileName: string;
  includeMetadata: boolean;
  sortMembersAlphabetically?: boolean;
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

  get scope(): string[] {
    return this.config.scope;
  }

  get outputDir(): string {
    return this.config.outputDir;
  }

  get targetGenerator(): Generator {
    return this.config.targetGenerator;
  }

  get indexOnly(): boolean {
    return this.config.indexOnly;
  }

  public getDefaultGroupName(): string {
    return this.config.defaultGroupName;
  }

  public getOpenApiTitle(): string | undefined {
    return this.config.openApiTitle;
  }

  public getNamespace(): string | undefined {
    return this.config.namespace;
  }

  public openApiFileName(): string {
    return this.config.openApiFileName;
  }

  public includeMetadata(): boolean {
    return this.config.includeMetadata;
  }

  public sortMembersAlphabetically(): boolean {
    return this.config.sortMembersAlphabetically ?? false;
  }
}
