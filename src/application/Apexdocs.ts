import markdown from './generators/markdown';
import openApi from './generators/openapi';

import { ApexFileReader } from './apex-file-reader';
import { DefaultFileSystem } from './file-system';
import { Logger } from '#utils/logger';
import { UserDefinedConfig } from '../core/shared/types';

/**
 * Application entry-point to generate documentation out of Apex source files.
 */
export class Apexdocs {
  /**
   * Generates documentation out of Apex source files.
   */
  static generate(config: UserDefinedConfig): void {
    Logger.logSingle('Initializing...', false);

    const fileBodies = ApexFileReader.processFiles(new DefaultFileSystem(), config.sourceDir, config.includeMetadata);

    switch (config.targetGenerator) {
      case 'markdown':
        markdown(fileBodies, config);
        break;
      case 'openapi':
        openApi(fileBodies, config);
        break;
    }
  }
}
