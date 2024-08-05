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

  get scope(): string[] {
    return this.config.scope;
  }

  get targetGenerator(): Generator {
    return this.config.targetGenerator;
  }

  get indexOnly(): boolean {
    return this.config.indexOnly;
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
}
