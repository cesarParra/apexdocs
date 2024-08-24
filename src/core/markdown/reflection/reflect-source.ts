import { ParsedFile, UnparsedSourceFile } from '../../shared/types';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import * as A from 'fp-ts/lib/Array';
import { reflect as mirrorReflection, Type } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { parseApexMetadata } from '../../parse-apex-metadata';
import { ParsingError } from '@cparra/apex-reflection/index';
import { apply } from '#utils/fp';
import { Semigroup } from 'fp-ts/Semigroup';

export class ReflectionErrors {
  readonly _tag = 'ReflectionErrors';

  constructor(public errors: ReflectionError[]) {}
}

export class ReflectionError {
  constructor(
    public file: string,
    public message: string,
  ) {}
}

async function reflectAsync(rawSource: string): Promise<Type> {
  return new Promise((resolve, reject) => {
    const result = mirrorReflection(rawSource);
    if (result.typeMirror) {
      return resolve(result.typeMirror);
    } else if (result.error) {
      return reject(result.error);
    } else {
      return reject(new Error('Unknown error'));
    }
  });
}

export function reflectSourceCode(apexBundles: UnparsedSourceFile[]) {
  const semiGroupReflectionError: Semigroup<ReflectionErrors> = {
    concat: (x, y) => new ReflectionErrors([...x.errors, ...y.errors]),
  };
  const Ap = TE.getApplicativeTaskValidation(T.ApplyPar, semiGroupReflectionError);

  return pipe(apexBundles, A.traverse(Ap)(myPipe));
}

function myPipe(apexBundle: UnparsedSourceFile): TE.TaskEither<ReflectionErrors, ParsedFile> {
  const convertToParsedFile: (typeMirror: Type) => ParsedFile = apply(toParsedFile, apexBundle.filePath);
  const withMetadata: (parsedFile: ParsedFile) => ParsedFile = apply(addMetadata, apexBundle.metadataContent);

  return pipe(apexBundle, reflectAsTask, TE.map(convertToParsedFile), TE.map(withMetadata));
}

function reflectAsTask(apexBundle: UnparsedSourceFile): TE.TaskEither<ReflectionErrors, Type> {
  return TE.tryCatch(
    () => reflectAsync(apexBundle.content),
    (error) =>
      new ReflectionErrors([new ReflectionError(apexBundle.filePath, (error as ParsingError | Error).message)]),
  );
}

function toParsedFile(filePath: string, typeMirror: Type): ParsedFile {
  return {
    source: {
      filePath: filePath,
      name: typeMirror.name,
      type: typeMirror.type_name,
    },
    type: typeMirror,
  };
}

function addMetadata(rawMetadataContent: string | null, parsedFile: ParsedFile) {
  return {
    ...parsedFile,
    type: addFileMetadataToTypeAnnotation(parsedFile.type, rawMetadataContent),
  };
}

function addFileMetadataToTypeAnnotation(type: Type, metadata: string | null): Type {
  return pipe(
    O.fromNullable(metadata),
    O.map((metadata) => {
      // TODO: Do we need to error check this, as it is coming from an external library?
      // Or maybe what we do is return the Either from the parse-apex-metadata function?
      const metadataParams = parseApexMetadata(metadata);
      metadataParams.forEach((value, key) => {
        const declaration = `${key}: ${value}`;
        type.annotations.push({
          rawDeclaration: declaration,
          name: declaration,
          type: declaration,
        });
      });
      return type;
    }),
    O.getOrElse(() => type),
  );
}
