import { ApexFileReader } from '../service/apex-file-reader';
import { DefaultFileSystem } from '../service/file-system';
import { ReflectionResult, reflect, Type } from '@cparra/apex-reflection';
import { Logger } from '../util/logger';
import { createManifest } from '../service/manifest-factory';
import { RawBodyParser } from '../service/parser';
import { Settings, TargetFile } from '../settings';
import Transpiler from '../transpiler/transpiler';
import { FileWriter } from '../service/file-writer';
import ErrorLogger from '../util/error-logger';
import ApexBundle from '../core/apex-bundle';
import Manifest from '../core/manifest';
import { TypesRepository } from '../model/types-repository';
import { TypeTranspilerFactory } from '../transpiler/factory';
import { generateMarkdownFiles } from './generators/generate-markdown-files';

/**
 * Application entry-point to generate documentation out of Apex source files.
 */
export class Apexdocs {
  /**
   * Generates documentation out of Apex source files.
   */
  static generate(): void {
    Logger.logSingle('Initializing...', false);
    const fileBodies = ApexFileReader.processFiles(new DefaultFileSystem());

    if (Settings.getInstance().targetGenerator === 'plain-markdown') {
      generateMarkdownFiles(fileBodies);
    } else {
      const manifest = createManifest(new RawBodyParser(fileBodies), this._reflectionWithLogger);
      TypesRepository.getInstance().populateAll(manifest.types);
      const filteredTypes = this.filterByScopes(manifest);
      TypesRepository.getInstance().populateScoped(filteredTypes);
      const processor = TypeTranspilerFactory.get(Settings.getInstance().targetGenerator);
      Transpiler.generate(filteredTypes, processor);
      const generatedFiles = processor.fileBuilder().files();

      const files: TargetFile[] = [];
      FileWriter.write(generatedFiles, (file: TargetFile) => {
        Logger.logSingle(`${file.name} processed.`, false, 'green', false);
        files.push(file);
      });

      Settings.getInstance().onAfterProcess(files);

      // Error logging
      ErrorLogger.logErrors(filteredTypes);
    }
  }

  private static filterByScopes(manifest: Manifest) {
    let filteredTypes: Type[];
    let filteredLogMessage;
    if (Settings.getInstance().config.targetGenerator !== 'openapi') {
      filteredTypes = manifest.filteredByAccessModifierAndAnnotations(Settings.getInstance().scope);
      filteredLogMessage = `Filtered ${manifest.types.length - filteredTypes.length} file(s) based on scope: ${
        Settings.getInstance().scope
      }`;
    } else {
      // If we are dealing with an OpenApi generator, we ignore the passed in access modifiers, and instead
      // we only keep classes annotated as @RestResource
      filteredTypes = manifest.filteredByAccessModifierAndAnnotations([
        'restresource',
        'httpdelete',
        'httpget',
        'httppatch',
        'httppost',
        'httpput',
      ]);
      filteredLogMessage = `Filtered ${
        manifest.types.length - filteredTypes.length
      } file(s), only keeping classes annotated as @RestResource.`;
    }
    Logger.clear();

    Logger.logSingle(filteredLogMessage, false, 'green', false);
    Logger.logSingle(`Creating documentation for ${filteredTypes.length} file(s)`, false, 'green', false);
    return filteredTypes;
  }

  static _reflectionWithLogger = (apexBundle: ApexBundle): ReflectionResult => {
    const result = reflect(apexBundle.rawTypeContent);
    if (result.error) {
      Logger.error(`${apexBundle.filePath} - Parsing error ${result.error?.message}`);
    }
    return result;
  };
}
