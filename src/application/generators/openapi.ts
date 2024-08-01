import { createManifest } from '../../core/openapi/manifest-factory';
import { RawBodyParser } from '../../core/openapi/parser';
import { TypesRepository } from '../../core/openapi/types-repository';
import { Settings, TargetFile } from '../../core/settings';
import Transpiler from '../../core/openapi/transpiler';
import { FileWriter } from '../file-writer';
import { Logger } from '#utils/logger';
import ErrorLogger from '#utils/error-logger';
import { reflect, ReflectionResult } from '@cparra/apex-reflection';
import Manifest from '../../core/manifest';
import { SourceFile } from '../../core/shared/types';
import { OpenApiDocsProcessor } from '../../core/openapi/open-api-docs-processor';

export default function openApi(fileBodies: SourceFile[]) {
  const manifest = createManifest(new RawBodyParser(fileBodies), reflectionWithLogger);
  TypesRepository.getInstance().populateAll(manifest.types);
  const filteredTypes = filterByScopes(manifest);
  const processor = new OpenApiDocsProcessor();
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

function reflectionWithLogger(apexBundle: SourceFile): ReflectionResult {
  const result = reflect(apexBundle.content);
  if (result.error) {
    Logger.error(`${apexBundle.filePath} - Parsing error ${result.error?.message}`);
  }
  return result;
}

function filterByScopes(manifest: Manifest) {
  // If we are dealing with an OpenApi generator, we ignore the passed in access modifiers, and instead
  // we only keep classes annotated as @RestResource
  const filteredTypes = manifest.filteredByAccessModifierAndAnnotations([
    'restresource',
    'httpdelete',
    'httpget',
    'httppatch',
    'httppost',
    'httpput',
  ]);
  const filteredLogMessage = `Filtered ${
    manifest.types.length - filteredTypes.length
  } file(s), only keeping classes annotated as @RestResource.`;
  Logger.clear();

  Logger.logSingle(filteredLogMessage, false, 'green', false);
  Logger.logSingle(`Creating documentation for ${filteredTypes.length} file(s)`, false, 'green', false);
  return filteredTypes;
}
