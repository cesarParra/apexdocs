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
  label: string;
  name: string;
};

export function reflectSObjectSources(objectSources: UnparsedSObjectBundle[]) {
  const semiGroupReflectionError: Semigroup<ReflectionErrors> = {
    concat: (x, y) => new ReflectionErrors([...x.errors, ...y.errors]),
  };
  const Ap = TE.getApplicativeTaskValidation(T.ApplyPar, semiGroupReflectionError);

  return pipe(objectSources, A.traverse(Ap)(reflectSObjectSource));
}

function reflectSObjectSource(objectSource: UnparsedSObjectBundle): TE.TaskEither<ReflectionErrors, ParsedFile> {
  return pipe(
    TE.fromEither(E.tryCatch(() => new XMLParser().parse(objectSource.content), E.toError)),
    TE.map((metadata) => addName(metadata as ObjectMetadata, objectSource.filePath)),
    TE.map((metadata) => addTypeName(metadata)),
    TE.map((metadata) => toParsedFile(objectSource.filePath, metadata)),
    TE.mapLeft((error) => new ReflectionErrors([new ReflectionError(objectSource.filePath, error.message)])),
  );
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

function toParsedFile(filePath: string, typeMirror: ObjectMetadata): ParsedFile {
  return {
    source: {
      filePath: filePath,
      name: typeMirror.label,
      type: typeMirror.type_name,
    },
    type: typeMirror,
  };
}
