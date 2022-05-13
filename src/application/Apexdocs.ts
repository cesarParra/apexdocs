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

/**
 * Application entry-point to generate documentation out of Apex source files.
 */
export class Apexdocs {
  /**
   * Generates documentation out of Apex source files.
   */
  static generate(): void {
    const fileBodies = ApexFileReader.processFiles(new DefaultFileSystem());
    const manifest = createManifest(new RawBodyParser(fileBodies), this._reflectionWithLogger);

    const filteredTypes: Type[] = manifest.filteredByAccessModifierAndAnnotations(Settings.getInstance().scope);
    TypesRepository.getInstance().populate(filteredTypes);

    Logger.log(`Parsed ${filteredTypes.length} files`);
    const processor = Settings.getInstance().typeTranspiler;
    Transpiler.generate(filteredTypes, processor);
    const generatedFiles = processor.fileBuilder().files();
    FileWriter.write(generatedFiles, (fileName: string) => {
      Logger.log(`${fileName} processed.`);
    });

    // Error logging
    ErrorLogger.logErrors(filteredTypes);
  }

  static _reflectionWithLogger = (declarationBody: string): ReflectionResult => {
    const result = reflect(declarationBody);
    if (result.error) {
      Logger.log(`Parsing error ${result.error?.message}`);
    }
    return result;
  };
}
