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

    // TODO: This is needed for openapi, let's figure it out
    //this.initializeSettings(config);
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

  // private static initializeSettings(argv: UserDefinedMarkdownConfig) {
  //   const targetGenerator = argv.targetGenerator as Generator;
  //   Settings.build({
  //     sourceDirectory: argv.sourceDir,
  //     scope: argv.scope,
  //     outputDir: argv.targetDir,
  //     targetGenerator: targetGenerator,
  //     defaultGroupName: argv.defaultGroupName,
  //     openApiTitle: argv.openApiTitle,
  //     namespace: argv.namespace,
  //     openApiFileName: argv.openApiFileName,
  //     sortMembersAlphabetically: argv.sortMembersAlphabetically,
  //     includeMetadata: argv.includeMetadata,
  //   });
  // }
}
