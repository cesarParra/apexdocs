import { createManifest } from '../../core/openapi/manifest-factory';
import { RawBodyParser } from '../../core/openapi/parser';
import { TypesRepository } from '../../core/openapi/types-repository';
import Transpiler from '../../core/openapi/transpiler';
import { Logger } from '#utils/logger';
import ErrorLogger from '#utils/error-logger';
import { reflect, ReflectionResult } from '@cparra/apex-reflection';
import Manifest from '../../core/manifest';
import { PageData, UnparsedSourceFile, UserDefinedOpenApiConfig } from '../../core/shared/types';
import { OpenApiDocsProcessor } from '../../core/openapi/open-api-docs-processor';
import { writeFiles } from '../file-writer';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { OpenApiSettings } from '../../core/openApiSettings';

export default async function openApi(fileBodies: UnparsedSourceFile[], config: UserDefinedOpenApiConfig) {
  OpenApiSettings.build({
    sourceDirectory: config.sourceDir,
    outputDir: config.targetDir,
    openApiFileName: config.fileName,
    openApiTitle: config.title,
    namespace: config.namespace,
    version: config.apiVersion,
  });

  const manifest = createManifest(new RawBodyParser(fileBodies), reflectionWithLogger);
  TypesRepository.getInstance().populateAll(manifest.types);
  const filteredTypes = filterByScopes(manifest);
  const processor = new OpenApiDocsProcessor();
  Transpiler.generate(filteredTypes, processor);
  const generatedFiles = processor.fileBuilder().files();

  await pipe(
    writeFiles(generatedFiles, config.targetDir, (file: PageData) => {
      Logger.logSingle(`${file.outputDocPath} processed.`, 'green');
    }),
    TE.mapError((error) => Logger.error(error)),
  )();

  // Logs any errors that the types might have in their doc comment's error field
  ErrorLogger.logErrors(filteredTypes);
}

function reflectionWithLogger(apexBundle: UnparsedSourceFile): ReflectionResult {
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

  Logger.logSingle(filteredLogMessage, 'green');
  Logger.logSingle(`Creating documentation for ${filteredTypes.length} file(s)`, 'green');
  return filteredTypes;
}
