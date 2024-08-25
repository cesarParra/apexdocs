export interface SettingsConfig {
  sourceDirectory: string;
  outputDir: string;
  openApiFileName: string;
  defaultGroupName: string;
  namespace?: string;
  sortMembersAlphabetically?: boolean;
  openApiTitle?: string;
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
