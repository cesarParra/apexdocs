import { ApexFileReader } from '../service/apex-file-reader';
import { DefaultFileSystem } from '../service/file-system';
import { ReflectionResult, reflect, Type, ClassMirror } from '@cparra/apex-reflection';
import { Logger } from '../util/logger';
import { createManifest } from '../service/manifest-factory';
import { RawBodyParser } from '../service/parser';
import { Settings } from '../settings';
import Transpiler from '../transpiler/transpiler';
import { FileWriter } from '../service/file-writer';
import { TypesRepository } from '../model/types-repository';
import ErrorLogger from '../util/error-logger';
import ApexBundle from '../model/apex-bundle';

/**
 * Application entry-point to generate documentation out of Apex source files.
 */
export class Apexdocs {
  /**
   * Generates documentation out of Apex source files.
   */
  static generate(): void {
    Logger.log('Initializing...');
    const fileBodies = ApexFileReader.processFiles(new DefaultFileSystem());
    const manifest = createManifest(new RawBodyParser(fileBodies), this._reflectionWithLogger);

    const filteredTypes: Type[] = manifest.filteredByAccessModifierAndAnnotations(Settings.getInstance().scope);
    TypesRepository.getInstance().populate(filteredTypes);
    Logger.clear();

    Logger.logSingle(`Parsed ${filteredTypes.length} files`, false, 'green', false);
    const processor = Settings.getInstance().typeTranspiler;
    Transpiler.generate(filteredTypes, processor);
    const generatedFiles = processor.fileBuilder().files();
    FileWriter.write(generatedFiles, (fileName: string) => {
      Logger.logSingle(`${fileName} processed.`, false, 'green', false);
    });

    // Error logging
    ErrorLogger.logErrors(filteredTypes);
  }

  static _reflectionWithLogger = (apexBundle: ApexBundle): ReflectionResult => {
    const result = reflect(apexBundle.rawTypeContent);
    if (result.error) {
      Logger.error(`${apexBundle.filePath} - Parsing error ${result.error?.message}`);
    }
    return result;
  };
}
