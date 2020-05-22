import * as fs from 'fs';
import Settings from './Settings';

interface ConfigHome {
  header?: string;
}

interface ConfigContent {
  startingHeadingLevel?: number;
  includeAuthor?: string;
  includeDate?: string;
}
interface Config {
  root?: string;
  home?: ConfigHome;
  content?: ConfigContent;
}

export default class Configuration {
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
