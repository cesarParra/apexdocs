import markdown from './generators/markdown';
import openApi from './generators/openapi';

import { ApexFileReader } from './apex-file-reader';
import { DefaultFileSystem } from './file-system';
import { Logger } from '#utils/logger';
import { Settings } from '../core/settings';
import { AllConfigurableOptions } from '../cli/args';
import { Generator } from '../core/shared/types';

/**
 * Application entry-point to generate documentation out of Apex source files.
 */
export class Apexdocs {
  /**
   * Generates documentation out of Apex source files.
   */
  static generate(config: AllConfigurableOptions): void {
    Logger.logSingle('Initializing...', false);
    this.initializeSettings(config);
    const fileBodies = ApexFileReader.processFiles(new DefaultFileSystem());

    switch (Settings.getInstance().targetGenerator) {
      case 'markdown':
        markdown(fileBodies);
        break;
      case 'openapi':
        openApi(fileBodies);
        break;
    }
  }

  private static initializeSettings(argv: AllConfigurableOptions) {
    const targetGenerator = argv.targetGenerator as Generator;
    Settings.build({
      sourceDirectory: argv.sourceDir,
      scope: argv.scope,
      outputDir: argv.targetDir,
      targetGenerator: targetGenerator,
      indexOnly: argv.indexOnly,
      defaultGroupName: argv.defaultGroupName,
      openApiTitle: argv.openApiTitle,
      namespace: argv.namespace,
      openApiFileName: argv.openApiFileName,
      sortMembersAlphabetically: argv.sortMembersAlphabetically,
      includeMetadata: argv.includeMetadata,
      onAfterProcess: argv.onAfterProcess,
      onBeforeFileWrite: argv.onBeforeFileWrite,
      frontMatterHeader: argv.frontMatterHeader,
    });
  }
}
