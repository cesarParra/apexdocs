import { ParsedFile, UnparsedCustomMetadataBundle } from '../../shared/types';
import * as TE from 'fp-ts/TaskEither';
import { ReflectionError, ReflectionErrors } from '../../errors/errors';
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { XMLParser } from 'fast-xml-parser';

export type CustomMetadataMetadata = {
  type_name: 'custommetadata';
  protected: boolean;
  name: string;
  label?: string | null;
  description: string | null;
  parentName: string;
  // TODO: Reflect values
};

export function reflectCustomMetadataSources(
  customMetadataSources: UnparsedCustomMetadataBundle[],
): TE.TaskEither<ReflectionErrors, ParsedFile<CustomMetadataMetadata>[]> {
  return pipe(customMetadataSources, A.traverse(TE.ApplicativePar)(reflectCustomMetadataSource));
}

function reflectCustomMetadataSource(
  customMetadataSource: UnparsedCustomMetadataBundle,
): TE.TaskEither<ReflectionErrors, ParsedFile<CustomMetadataMetadata>> {
  return pipe(
    E.tryCatch(() => new XMLParser().parse(customMetadataSource.content), E.toError),
    E.flatMap(validate),
    E.map(toCustomMetadataMetadata),
    E.map((metadata) => addName(metadata, customMetadataSource.name)),
    E.map((metadata) => addParentName(metadata, customMetadataSource.parentName)),
    E.map((metadata) => toParsedFile(customMetadataSource.filePath, metadata)),
    E.mapLeft((error) => new ReflectionErrors([new ReflectionError(customMetadataSource.filePath, error.message)])),
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
  const defaultValues = {
    label: null,
    description: null,
  };

  return {
    ...defaultValues,
    ...customMetadata,
    type_name: 'custommetadata',
  } as CustomMetadataMetadata;
}

function addName(metadata: CustomMetadataMetadata, name: string): CustomMetadataMetadata {
  return { ...metadata, name };
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
