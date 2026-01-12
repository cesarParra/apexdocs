import { ParsedFile, UnparsedCustomMetadataBundle } from '../../shared/types';
import * as TE from 'fp-ts/TaskEither';
import { ReflectionError, ReflectionErrors } from '../../errors/errors';
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { XMLParser } from 'fast-xml-parser';
import { noopReflectionDebugLogger, type ReflectionDebugLogger } from '../apex/reflect-apex-source';

export type CustomMetadataMetadata = {
  type_name: 'custommetadata';
  protected: boolean;
  apiName: string;
  name: string;
  label?: string | null;
  parentName: string;
};

export function reflectCustomMetadataSources(
  customMetadataSources: UnparsedCustomMetadataBundle[],
  debugLogger: ReflectionDebugLogger = noopReflectionDebugLogger,
): TE.TaskEither<ReflectionErrors, ParsedFile<CustomMetadataMetadata>[]> {
  return pipe(
    customMetadataSources,
    A.traverse(TE.ApplicativePar)((bundle) => reflectCustomMetadataSource(bundle, debugLogger)),
  );
}

function reflectCustomMetadataSource(
  customMetadataSource: UnparsedCustomMetadataBundle,
  debugLogger: ReflectionDebugLogger,
): TE.TaskEither<ReflectionErrors, ParsedFile<CustomMetadataMetadata>> {
  debugLogger.onStart(customMetadataSource.filePath);

  return pipe(
    E.tryCatch(() => new XMLParser().parse(customMetadataSource.content), E.toError),
    E.flatMap(validate),
    E.map(toCustomMetadataMetadata),
    E.map((metadata) => addNames(metadata, customMetadataSource.name, customMetadataSource.apiName)),
    E.map((metadata) => addParentName(metadata, customMetadataSource.parentName)),
    E.map((metadata) => toParsedFile(customMetadataSource.filePath, metadata)),
    E.mapLeft((error) => {
      debugLogger.onFailure(customMetadataSource.filePath, error.message);
      return new ReflectionErrors([new ReflectionError(customMetadataSource.filePath, error.message)]);
    }),
    E.map((parsed) => {
      debugLogger.onSuccess(customMetadataSource.filePath);
      return parsed;
    }),
    TE.fromEither,
  );
}

function validate(parsedResult: unknown): E.Either<Error, { CustomMetadata: unknown }> {
  const err = E.left(new Error('Invalid custom metadata'));

  function isObject(value: unknown) {
    return typeof value === 'object' && value !== null ? E.right(value) : err;
  }

  function hasTheCustomMetadataKey(value: object) {
    return 'CustomMetadata' in value ? E.right(value) : err;
  }

  return pipe(parsedResult, isObject, E.chain(hasTheCustomMetadataKey));
}

function toCustomMetadataMetadata(parserResult: { CustomMetadata: unknown }): CustomMetadataMetadata {
  const customMetadata =
    parserResult?.CustomMetadata != null && typeof parserResult.CustomMetadata === 'object'
      ? parserResult.CustomMetadata
      : {};
  const defaultValues: Partial<CustomMetadataMetadata> = {
    label: null,
  };

  return {
    ...defaultValues,
    ...customMetadata,
    type_name: 'custommetadata',
  } as CustomMetadataMetadata;
}

function addNames(metadata: CustomMetadataMetadata, name: string, apiName: string): CustomMetadataMetadata {
  return { ...metadata, name, apiName };
}

function addParentName(metadata: CustomMetadataMetadata, parentName: string): CustomMetadataMetadata {
  return { ...metadata, parentName };
}

function toParsedFile(filePath: string, typeMirror: CustomMetadataMetadata): ParsedFile<CustomMetadataMetadata> {
  return {
    source: {
      filePath,
      name: typeMirror.name,
      type: typeMirror.type_name,
    },
    type: typeMirror,
  };
}
