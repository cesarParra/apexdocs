import DocsProcessor from './DocsProcessor';

export default class Settings {
  private static instance: Settings;

  private desiredScope: string[] = ['global', 'public', 'namespaceaccessible'];
  private outputDir: string = 'docs';
  private configPath: string | null = null;
  private shouldGroup: boolean | null = true;
  private processor: DocsProcessor | null = null;
  private indexOnly: boolean = false;


  private constructor() {}

  static getInstance(): Settings {
    if (!Settings.instance) {
      Settings.instance = new Settings();
    }

    return Settings.instance;
  }

  setScope(desiredScope: string[]) {
    this.desiredScope = desiredScope;
  }

  getScope() {
    return this.desiredScope;
  }

  setOutputDir(outputDir: string) {
    this.outputDir = outputDir;
  }

  getOutputDir() {
    return this.outputDir;
  }

  setDocsProcessor(processor: DocsProcessor) {
    this.processor = processor;
  }

  getDocsProcessor(): DocsProcessor | null {
    return this.processor;
  }

  setConfigPath(configPath: string) {
    this.configPath = configPath;
  }

  getConfigPath() {
    return this.configPath;
  }

  setShouldGroup(shouldGroup: boolean) {
    this.shouldGroup = shouldGroup;
  }

  getShouldGroup() {
    return this.shouldGroup;
  }
  
  getIndexOnly(): boolean {
    return this.indexOnly;
  }
  setIndexOnly(value: boolean) {
    this.indexOnly = value;
  }
  

  includeNamespaceAccessible() {
    return this.getScope().includes('namespaceaccessible');
  }
}
