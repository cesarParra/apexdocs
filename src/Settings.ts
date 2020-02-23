export default class Settings {
  private static instance: Settings;

  private desiredScope: string[] = ['global', 'public'];
  private outputDir: string = 'docs';

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
}
