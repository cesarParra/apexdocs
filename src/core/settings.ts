import { GeneratorChoices } from './generator-choices';

export type OnBeforeFileWrite = (file: TargetFile) => TargetFile;

export type TargetFile = {
  name: string;
  extension: string;
  dir: OutputDir;
};

export type OutputDir = {
  baseDir: string;
  fileDir: string;
};

export type TargetType = {
  name: string;
  typeName: 'class' | 'interface' | 'enum';
  accessModifier: string;
  description?: string;
  group?: string;
};

export interface SettingsConfig {
  sourceDirectory: string;
  scope: string[];
  outputDir: string;
  targetGenerator: GeneratorChoices;
  indexOnly: boolean;
  defaultGroupName: string;
  openApiTitle?: string;
  namespace?: string;
  openApiFileName: string;
  includeMetadata: boolean;
  sortMembersAlphabetically?: boolean;
  onAfterProcess?: (files: TargetFile[]) => void;
  onBeforeFileWrite?: (file: TargetFile) => TargetFile;
  frontMatterHeader?: (file: TargetType) => string[];
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

  get targetGenerator(): GeneratorChoices {
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

  public sortMembersAlphabetically(): boolean {
    return this.config.sortMembersAlphabetically ?? false;
  }

  public onAfterProcess(files: TargetFile[]): void {
    if (this.config.onAfterProcess) {
      this.config.onAfterProcess(files);
    }
  }

  public onBeforeFileWrite(file: TargetFile): TargetFile {
    if (this.config.onBeforeFileWrite) {
      return this.config.onBeforeFileWrite(file);
    }
    return file;
  }

  public frontMatterHeader(file: TargetType): string[] {
    if (this.config.frontMatterHeader) {
      return this.config.frontMatterHeader(file);
    }
    return [];
  }
}