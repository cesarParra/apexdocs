import { ParsedFile, UnparsedSObjectBundle } from '../../shared/types';
import { XMLParser } from 'fast-xml-parser';
import * as TE from 'fp-ts/TaskEither';
import { ReflectionError, ReflectionErrors } from '../../errors/errors';
import { Semigroup } from 'fp-ts/Semigroup';
import * as T from 'fp-ts/Task';
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';

export type ObjectMetadata = {
  type_name: 'sobject';
  deploymentStatus: string;
  visibility: string;
  label: string;
  name: string;
};

export function reflectSObjectSources(
  objectSources: UnparsedSObjectBundle[],
): TE.TaskEither<ReflectionErrors, ParsedFile<ObjectMetadata>[]> {
  const semiGroupReflectionError: Semigroup<ReflectionErrors> = {
    concat: (x, y) => new ReflectionErrors([...x.errors, ...y.errors]),
  };
  const Ap = TE.getApplicativeTaskValidation(T.ApplyPar, semiGroupReflectionError);

  return pipe(objectSources, A.traverse(Ap)(reflectSObjectSource));
}

function reflectSObjectSource(
  objectSource: UnparsedSObjectBundle,
): TE.TaskEither<ReflectionErrors, ParsedFile<ObjectMetadata>> {
  return pipe(
    E.tryCatch(() => new XMLParser().parse(objectSource.content), E.toError),
    E.flatMap(validate),
    E.map(toObjectMetadata),
    E.map((metadata) => addName(metadata, objectSource.filePath)),
    E.map(addTypeName),
    E.map((metadata) => toParsedFile(objectSource.filePath, metadata)),
    E.mapLeft((error) => new ReflectionErrors([new ReflectionError(objectSource.filePath, error.message)])),
    TE.fromEither,
  );
}

function validate(parseResult: unknown): E.Either<Error, { CustomObject: object }> {
  if (typeof parseResult !== 'object' || parseResult === null) {
    return E.left(new Error('Invalid SObject metadata'));
  }

  // Confirm that the object has a CustomObject property
  if (!('CustomObject' in parseResult)) {
    return E.left(new Error('Invalid SObject metadata'));
  }

  // Confirm that the CustomObject property is an object that contains that "label" property
  if (typeof (parseResult as { CustomObject: object }).CustomObject !== 'object') {
    return E.left(new Error('Invalid SObject metadata'));
  }

  if (!('label' in (parseResult as { CustomObject: object }).CustomObject)) {
    return E.left(new Error('Invalid SObject metadata'));
  }

  return E.right(parseResult as { CustomObject: object });
}

function toObjectMetadata(parserResult: { CustomObject: object }): ObjectMetadata {
  const defaultValues = {
    deploymentStatus: 'Deployed',
    visibility: 'Public',
  };
  return { ...defaultValues, ...parserResult.CustomObject } as ObjectMetadata;
}

function extractNameFromFilePath(filePath: string): string {
  return filePath.split('/').pop()!.split('.').shift()!;
}

function addName(objectMetadata: ObjectMetadata, filePath: string): ObjectMetadata {
  return {
    ...objectMetadata,
    name: extractNameFromFilePath(filePath),
  };
}

function addTypeName(objectMetadata: ObjectMetadata): ObjectMetadata {
  return {
    ...objectMetadata,
    type_name: 'sobject',
  };
}

function toParsedFile(filePath: string, typeMirror: ObjectMetadata): ParsedFile<ObjectMetadata> {
  return {
    source: {
      filePath: filePath,
      name: typeMirror.name,
      type: typeMirror.type_name,
    },
    type: typeMirror,
  };
}
