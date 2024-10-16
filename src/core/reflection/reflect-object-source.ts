import { ParsedFile, UnparsedObjectFile } from '../shared/types';
import { XMLParser } from 'fast-xml-parser';
import * as TE from 'fp-ts/TaskEither';
import { ReflectionError, ReflectionErrors } from '../errors/errors';
import { Semigroup } from 'fp-ts/Semigroup';
import * as T from 'fp-ts/Task';
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';

export type ObjectMetadata = {
  type_name: 'object';
  label: string;
  name: string;
};

export function reflectObjectSources(objectSources: UnparsedObjectFile[]) {
  const semiGroupReflectionError: Semigroup<ReflectionErrors> = {
    concat: (x, y) => new ReflectionErrors([...x.errors, ...y.errors]),
  };
  const Ap = TE.getApplicativeTaskValidation(T.ApplyPar, semiGroupReflectionError);

  return pipe(objectSources, A.traverse(Ap)(reflectObjectSource));
}

function reflectObjectSource(objectSource: UnparsedObjectFile): TE.TaskEither<ReflectionErrors, ParsedFile> {
  return pipe(
    TE.tryCatch(
      () => new XMLParser().parse(objectSource.content),
      (error) => new ReflectionErrors([new ReflectionError(objectSource.filePath, (error as Error).message)]),
    ),
    TE.map((metadata) => addName(metadata as ObjectMetadata, objectSource.filePath)),
    TE.map((metadata) => addTypeName(metadata)),
    TE.map((metadata) => toParsedFile(objectSource.filePath, metadata)),
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
    type_name: 'object',
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
