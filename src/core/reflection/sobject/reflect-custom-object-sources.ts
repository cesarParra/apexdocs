import { ParsedFile, UnparsedCustomObjectBundle } from '../../shared/types';
import { XMLParser } from 'fast-xml-parser';
import * as TE from 'fp-ts/TaskEither';
import { ReflectionError, ReflectionErrors } from '../../errors/errors';
import { Semigroup } from 'fp-ts/Semigroup';
import * as T from 'fp-ts/Task';
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { CustomFieldMetadata } from './reflect-custom-field-source';

export type CustomObjectMetadata = {
  type_name: 'customobject';
  deploymentStatus: string;
  visibility: string;
  label: string;
  name: string;
  description: string | null;
  fields: CustomFieldMetadata[];
};

export function reflectCustomObjectSources(
  objectBundles: UnparsedCustomObjectBundle[],
): TE.TaskEither<ReflectionErrors, ParsedFile<CustomObjectMetadata>[]> {
  const semiGroupReflectionError: Semigroup<ReflectionErrors> = {
    concat: (x, y) => new ReflectionErrors([...x.errors, ...y.errors]),
  };
  const Ap = TE.getApplicativeTaskValidation(T.ApplyPar, semiGroupReflectionError);

  return pipe(objectBundles, A.traverse(Ap)(reflectCustomObjectSource));
}

function reflectCustomObjectSource(
  objectSource: UnparsedCustomObjectBundle,
): TE.TaskEither<ReflectionErrors, ParsedFile<CustomObjectMetadata>> {
  return pipe(
    E.tryCatch(() => new XMLParser().parse(objectSource.content), E.toError),
    E.flatMap(validate),
    E.map(toObjectMetadata),
    E.map((metadata) => addName(metadata, objectSource.name)),
    E.map(addTypeName),
    E.map((metadata) => toParsedFile(objectSource.filePath, metadata)),
    E.mapLeft((error) => new ReflectionErrors([new ReflectionError(objectSource.filePath, error.message)])),
    TE.fromEither,
  );
}

function validate(parseResult: unknown): E.Either<Error, { CustomObject: object }> {
  const err = E.left(new Error('Invalid SObject metadata'));

  function isObject(value: unknown) {
    return typeof value === 'object' && value !== null ? E.right(value) : err;
  }

  function hasTheCustomObjectKey(value: object) {
    return 'CustomObject' in value ? E.right(value) : err;
  }

  function theCustomObjectKeyIsAnObject(value: Record<'CustomObject', unknown>) {
    return typeof value.CustomObject === 'object' ? E.right(value as Record<'CustomObject', object>) : err;
  }

  function theCustomObjectContainsTheLabelKey(value: Record<'CustomObject', object>) {
    return 'label' in value.CustomObject ? E.right(value) : err;
  }

  return pipe(
    parseResult,
    isObject,
    E.chain(hasTheCustomObjectKey),
    E.chain(theCustomObjectKeyIsAnObject),
    E.chain(theCustomObjectContainsTheLabelKey),
  );
}

function toObjectMetadata(parserResult: { CustomObject: object }): CustomObjectMetadata {
  const defaultValues = {
    deploymentStatus: 'Deployed',
    visibility: 'Public',
    description: null,
    fields: [] as CustomFieldMetadata[],
  };
  return { ...defaultValues, ...parserResult.CustomObject } as CustomObjectMetadata;
}

function addName(objectMetadata: CustomObjectMetadata, name: string): CustomObjectMetadata {
  return {
    ...objectMetadata,
    name,
  };
}

function addTypeName(objectMetadata: CustomObjectMetadata): CustomObjectMetadata {
  return {
    ...objectMetadata,
    type_name: 'customobject',
  };
}

function toParsedFile(filePath: string, typeMirror: CustomObjectMetadata): ParsedFile<CustomObjectMetadata> {
  return {
    source: {
      filePath: filePath,
      name: typeMirror.name,
      type: typeMirror.type_name,
    },
    type: typeMirror,
  };
}
