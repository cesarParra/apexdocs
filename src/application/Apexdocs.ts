import { ApexFileReader } from '../service/apex-file-reader';
import { DefaultFileSystem } from '../service/file-system';
import { ReflectionResult } from '@cparra/apex-reflection/index';
import { reflect } from '@cparra/apex-reflection';
import { Logger } from '../util/logger';
import { createManifest } from '../service/manifest-factory';
import { RawBodyParser } from '../service/parser';
import { Settings } from '../settings';
import Transpiler from '../transpiler/transpiler';
import { FileWriter } from '../service/file-writer';

export class Apexdocs {
  static generate(): void {
    const fileBodies = ApexFileReader.processFiles(new DefaultFileSystem());
    const reflectionWithLogger = (declarationBody: string): ReflectionResult => {
      const result = reflect(declarationBody);
      if (result.error) {
        Logger.log(`Parsing error ${result.error?.message}`);
      }
      return result;
    };
    const manifest = createManifest(new RawBodyParser(fileBodies), reflectionWithLogger);
    Logger.log(`Parsed ${manifest.types.length} files`);
    const processor = Settings.getInstance().typeTranspiler;
    Transpiler.generate(manifest.types, processor);
    const generatedFiles = processor.fileBuilder().files();
    FileWriter.write(generatedFiles, (fileName: string) => {
      Logger.log(`${fileName} processed.`);
    });
  }
}
