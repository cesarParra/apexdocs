import * as fs from 'fs';
import Settings from './Settings';

export default class Configuration {
  public static getHeader() {
    let headerContent;
    const configPath = Settings.getInstance().getConfigPath();
    if (!configPath) {
      return headerContent;
    }

    let config;
    try {
      const rawFile = fs.readFileSync(configPath);
      config = JSON.parse(rawFile.toString());
    } catch (error) {
      throw new Error('Error occurred while reading the configuration file ' + error.toString());
    }
    if (config.home && config.home.header) {
      const headerFilePath = config.home.header;
      try {
        const rawHeader = fs.readFileSync(headerFilePath);
        headerContent = rawHeader.toString();
      } catch (error) {
        throw new Error('Error occurred while reading the header file ' + error.toString());
      }
    }
  }

  public static shouldIncludeAuthor(): boolean {
    const configPath = Settings.getInstance().getConfigPath();
    if (!configPath) {
      return false;
    }

    let config;
    try {
      const rawFile = fs.readFileSync(configPath);
      config = JSON.parse(rawFile.toString());
    } catch (error) {
      throw new Error('Error occurred while reading the configuration file ' + error.toString());
    }
    if (config.content && config.content.includeAuthor) {
      return config.content.includeAuthor;
    }

    return false;
  }

  public static shouldIncludeDate(): boolean {
    const configPath = Settings.getInstance().getConfigPath();
    if (!configPath) {
      return false;
    }

    let config;
    try {
      const rawFile = fs.readFileSync(configPath);
      config = JSON.parse(rawFile.toString());
    } catch (error) {
      throw new Error('Error occurred while reading the configuration file ' + error.toString());
    }
    if (config.content && config.content.includeDate) {
      return config.content.includeDate;
    }

    return false;
  }
}
