import { createManifest } from '../../core/openapi/manifest-factory';
import { RawBodyParser } from '../../core/openapi/parser';
import { TypesRepository } from '../../core/openapi/types-repository';
import Transpiler from '../../core/openapi/transpiler';
import { Logger } from '#utils/logger';
import ErrorLogger from '#utils/error-logger';
import { ReflectionResult } from '@cparra/apex-reflection';
import Manifest from '../../core/manifest';
import { PageData, UnparsedApexBundle, UserDefinedOpenApiConfig } from '../../core/shared/types';
import { OpenApiDocsProcessor } from '../../core/openapi/open-api-docs-processor';
import { writeFiles } from '../file-writer';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { OpenApiSettings } from '../../core/openapi/openApiSettings';
import { reflectApexSource } from '../../core/reflection/apex/reflect-apex-source';
import * as E from 'fp-ts/Either';

export default async function openApi(
  logger: Logger,
  fileBodies: UnparsedApexBundle[],
  config: UserDefinedOpenApiConfig,
) {
  // For backwards compatibility, use sourceDir if provided, otherwise derive from file paths or use current directory
  // If sourceDir is an array, use the first directory
  const sourceDirectory =
    (Array.isArray(config.sourceDir) ? config.sourceDir[0] : config.sourceDir) ||
    (fileBodies.length > 0 ? fileBodies[0].filePath.split('/').slice(0, -1).join('/') : process.cwd());

  OpenApiSettings.build({
    sourceDirectory,
    outputDir: config.targetDir,
    openApiFileName: config.fileName,
    openApiTitle: config.title,
    namespace: config.namespace,
    version: config.apiVersion,
  });

  // Reflect Apex types using the shared reflection pipeline (worker-thread parallelism supported).
  const parsedFilesEither = await reflectApexSource(fileBodies, {
    parallelReflection: true,
    parallelReflectionMaxWorkers: undefined,
  })();

  if (E.isLeft(parsedFilesEither)) {
    const errors = parsedFilesEither.left;
    logger.error(errors);
    return;
  }

  // Convert ParsedFile[] into the reflection function signature expected by OpenAPI's manifest builder.
  // We construct a lookup by filePath so the existing OpenAPI parser can behave as before (one file at a time).
  const parsedFiles = parsedFilesEither.right;
  const reflectionByPath = new Map<string, ReflectionResult>();

  for (const parsed of parsedFiles) {
    // ParsedFile.source can be SourceFileMetadata (has filePath) or ExternalMetadata (no filePath).
    // OpenAPI is only built from actual Apex source files, so only use entries that have a filePath.
    if (!('filePath' in parsed.source)) {
      continue;
    }

    // ParsedFile.type is the reflected Type mirror. Wrap it as a ReflectionResult.
    reflectionByPath.set(parsed.source.filePath, { typeMirror: parsed.type });
  }

  function reflectFromMap(apexBundle: UnparsedApexBundle): ReflectionResult {
    const result = reflectionByPath.get(apexBundle.filePath);
    if (result) {
      return result;
    }
    // Preserve behavior of logging missing/failed reflections.
    logger.error(`${apexBundle.filePath} - Parsing error Unknown error`);
    return { typeMirror: null, error: new Error('Unknown error') } as unknown as ReflectionResult;
  }

  const manifest = createManifest(new RawBodyParser(logger, fileBodies), reflectFromMap);
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
