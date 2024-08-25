export interface SettingsConfig {
  sourceDirectory: string;
  outputDir: string;
  openApiFileName: string;
  defaultGroupName: string;
  namespace?: string;
  sortMembersAlphabetically?: boolean;
  openApiTitle?: string;
  version: string;
}

export class OpenApiSettings {
  private static instance: OpenApiSettings;

  private constructor(public config: SettingsConfig) {}

  public static build(config: SettingsConfig) {
    OpenApiSettings.instance = new OpenApiSettings(config);
  }

  public static getInstance(): OpenApiSettings {
    if (!OpenApiSettings.instance) {
      throw new Error('Settings has not been initialized');
    }
    return OpenApiSettings.instance;
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

  public getVersion(): string {
    return this.config.version;
  }
}
