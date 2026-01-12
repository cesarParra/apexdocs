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
import { reflectApexSourceBestEffort } from '../../core/reflection/apex/reflect-apex-source';
import { ReflectionErrors } from '../../core/errors/errors';
import * as E from 'fp-ts/Either';
import { FileWritingError } from '../errors';
import { createReflectionDebugLogger } from '#utils/reflection-debug-logger';
import type { ErrorCollector } from '#utils/error-collector';

export default async function openApi(
  logger: Logger,
  fileBodies: UnparsedApexBundle[],
  config: UserDefinedOpenApiConfig,
  errorCollector: ErrorCollector,
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

  const debugLogger = createReflectionDebugLogger(logger, (filePath, errorMessage) => {
    errorCollector.addFailure('apex', filePath, errorMessage);
  });

  const reflectedEither = await reflectApexSourceBestEffort(
    fileBodies,
    {
      parallelReflection: config.parallelReflection,
      parallelReflectionMaxWorkers: config.parallelReflectionMaxWorkers,
    },
    debugLogger,
  )();

  if (E.isLeft(reflectedEither)) {
    // Propagate the failure to the caller instead of swallowing it.
    // The CLI/application layer is responsible for end-of-run aggregation.
    return E.left(reflectedEither.left);
  }

  const { successes: parsedFiles, errors: recoverableErrors } = reflectedEither.right;

  if (recoverableErrors.errors.length > 0) {
    // Error details are recorded via the ErrorCollector callback; keep messaging consistent and high-level here.
    logger.logSingle(
      `⚠️ ${recoverableErrors.errors.length} file(s) failed to parse/reflect. Continuing with successfully reflected files.`,
      'red',
    );
  }

  const reflectionByPath = new Map<string, ReflectionResult>();

  for (const parsed of parsedFiles) {
    if (!('filePath' in parsed.source)) {
      continue;
    }

    reflectionByPath.set(parsed.source.filePath, { typeMirror: parsed.type });
  }

  function reflectFromMap(apexBundle: UnparsedApexBundle): ReflectionResult {
    const result = reflectionByPath.get(apexBundle.filePath);
    if (result) {
      return result;
    }

    logger.error(`${apexBundle.filePath} - Parsing error Unknown error`);
    return { typeMirror: null, error: new Error('Unknown error') } as unknown as ReflectionResult;
  }

  const manifest = createManifest(new RawBodyParser(fileBodies), reflectFromMap);
  TypesRepository.getInstance().populateAll(manifest.types);
  const filteredTypes = filterByScopes(logger, manifest);
  const processor = new OpenApiDocsProcessor(logger);
  Transpiler.generate(filteredTypes, processor);
  const generatedFiles = processor.fileBuilder().files();

  const writeResult = await pipe(
    writeFiles(generatedFiles, config.targetDir, (file: PageData) => {
      logger.logSingle(`${file.outputDocPath} processed.`, 'green');
    }),
    TE.mapLeft((error) => new FileWritingError('An error occurred while writing files to the system.', error)),
  )();

  if (E.isLeft(writeResult)) {
    return E.left(writeResult.left);
  }

  // Logs any errors that the types might have in their doc comment's error field
  ErrorLogger.logErrors(logger, filteredTypes);

  // If there were recoverable reflection failures, fail the generator so callers can set exit code.
  // Detailed per-file failures are recorded via the ErrorCollector callback.
  if (recoverableErrors.errors.length > 0) {
    errorCollector.addGlobalFailure(
      'other',
      `OpenAPI generation completed with ${recoverableErrors.errors.length} reflection error item(s).`,
      recoverableErrors,
    );
    // Fail the generator so callers can set exit code. Details already recorded in the collector.
    return E.left(new ReflectionErrors([]));
  }

  return E.right(undefined);
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
