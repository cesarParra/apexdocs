import { createManifest } from '../../core/openapi/manifest-factory';
import { RawBodyParser } from '../../core/openapi/parser';
import { TypesRepository } from '../../core/openapi/types-repository';
import Transpiler from '../../core/openapi/transpiler';
import { Logger } from '#utils/logger';
import ErrorLogger from '#utils/error-logger';
import { reflect, ReflectionResult } from '@cparra/apex-reflection';
import Manifest from '../../core/manifest';
import { PageData, UnparsedApexBundle, UserDefinedOpenApiConfig } from '../../core/shared/types';
import { OpenApiDocsProcessor } from '../../core/openapi/open-api-docs-processor';
import { writeFiles } from '../file-writer';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { OpenApiSettings } from '../../core/openapi/openApiSettings';
import { apply } from '#utils/fp';

export default async function openApi(
  logger: Logger,
  fileBodies: UnparsedApexBundle[],
  config: UserDefinedOpenApiConfig,
) {
  // For backwards compatibility, use sourceDir if provided, otherwise derive from file paths or use current directory
  const sourceDirectory =
    config.sourceDir ||
    (fileBodies.length > 0 ? fileBodies[0].filePath.split('/').slice(0, -1).join('/') : process.cwd());

  OpenApiSettings.build({
    sourceDirectory,
    outputDir: config.targetDir,
    openApiFileName: config.fileName,
    openApiTitle: config.title,
    namespace: config.namespace,
    version: config.apiVersion,
  });

  const manifest = createManifest(new RawBodyParser(logger, fileBodies), apply(reflectionWithLogger, logger));
  TypesRepository.getInstance().populateAll(manifest.types);
  const filteredTypes = filterByScopes(logger, manifest);
  const processor = new OpenApiDocsProcessor(logger);
  Transpiler.generate(filteredTypes, processor);
  const generatedFiles = processor.fileBuilder().files();

  await pipe(
    writeFiles(generatedFiles, config.targetDir, (file: PageData) => {
      logger.logSingle(`${file.outputDocPath} processed.`, 'green');
    }),
    TE.mapError((error) => logger.error(error)),
  )();

  // Logs any errors that the types might have in their doc comment's error field
  ErrorLogger.logErrors(logger, filteredTypes);
}

function reflectionWithLogger(logger: Logger, apexBundle: UnparsedApexBundle): ReflectionResult {
  const result = reflect(apexBundle.content);
  if (result.error) {
    logger.error(`${apexBundle.filePath} - Parsing error ${result.error?.message}`);
  }
  return result;
}

function filterByScopes(logger: Logger, manifest: Manifest) {
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

  logger.logSingle(filteredLogMessage, 'green');
  logger.logSingle(`Creating documentation for ${filteredTypes.length} file(s)`, 'green');
  return filteredTypes;
}
