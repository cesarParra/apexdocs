import * as fs from 'fs';
import Settings from './Settings';

interface ConfigHome {
  header?: string;
}

interface ConfigContent {
  startingHeadingLevel?: number;
  includeAuthor?: string;
  includeDate?: string;
  injections?: Injection;
}
interface Config {
  root?: string;
  defaultGroupName?: string;
  sourceLanguage?: string;
  home?: ConfigHome;
  content?: ConfigContent;
}

interface Injection {
  doc: DocInjection;
}

interface DocInjection {
  onInit: string[];
  onEnd: string[];
  method: MethodInjection;
}

interface MethodInjection {
  onInit: string[];
  onEnd: string[];
  onBeforeExample: string[];
}

export default class Configuration {
  public static getHeader() {
    let config = this.getConfig();
    if (!config?.home?.header) {
      return undefined;
    }

    const headerFilePath = config.home.header;
    try {
      const rawHeader = fs.readFileSync(headerFilePath);
      return rawHeader.toString();
    } catch (error) {
      throw new Error('Error occurred while reading the header file ' + error.toString());
    }
  }

  public static getConfig(): Config | undefined {
    const configPath = Settings.getInstance().getConfigPath();
    if (!configPath) {
      return undefined;
    }

    let config;
    try {
      const rawFile = fs.readFileSync(configPath);
      config = JSON.parse(rawFile.toString());
    } catch (error) {
      throw new Error('Error occurred while reading the configuration file ' + error.toString());
    }
    return config as Config;
  }
}
