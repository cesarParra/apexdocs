import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as A from 'fp-ts/lib/Array';
import { Annotation, reflect as mirrorReflection, Type } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { ParsingError } from '@cparra/apex-reflection';
import { apply } from '#utils/fp';
import { Semigroup } from 'fp-ts/Semigroup';
import { ParsedFile, UnparsedApexBundle } from '../../shared/types';
import { ReflectionError, ReflectionErrors } from '../../errors/errors';
import { parseApexMetadata } from '../../parse-apex-metadata';

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

export function reflectApexSource(apexBundles: UnparsedApexBundle[]) {
  const semiGroupReflectionError: Semigroup<ReflectionErrors> = {
    concat: (x, y) => new ReflectionErrors([...x.errors, ...y.errors]),
  };
  const Ap = TE.getApplicativeTaskValidation(T.ApplyPar, semiGroupReflectionError);

  return pipe(apexBundles, A.traverse(Ap)(reflectBundle));
}

function reflectBundle(apexBundle: UnparsedApexBundle): TE.TaskEither<ReflectionErrors, ParsedFile<Type>> {
  const convertToParsedFile: (typeMirror: Type) => ParsedFile<Type> = apply(toParsedFile, apexBundle.filePath);
  const withMetadata = apply(addMetadata, apexBundle.metadataContent);

  return pipe(apexBundle, reflectAsTask, TE.map(convertToParsedFile), TE.flatMap(withMetadata));
}

function reflectAsTask(apexBundle: UnparsedApexBundle): TE.TaskEither<ReflectionErrors, Type> {
  return TE.tryCatch(
    () => reflectAsync(apexBundle.content),
    (error) =>
      new ReflectionErrors([new ReflectionError(apexBundle.filePath, (error as ParsingError | Error).message)]),
  );
}

function toParsedFile(filePath: string, typeMirror: Type): ParsedFile<Type> {
  return {
    source: {
      filePath: filePath,
      name: typeMirror.name,
      type: typeMirror.type_name,
    },
    type: typeMirror,
  };
}

function addMetadata(
  rawMetadataContent: string | null,
  parsedFile: ParsedFile<Type>,
): TE.TaskEither<ReflectionErrors, ParsedFile<Type>> {
  return TE.fromEither(
    pipe(
      parsedFile.type,
      (type) => addFileMetadataToTypeAnnotation(type as Type, rawMetadataContent),
      E.map((type) => ({ ...parsedFile, type })),
      E.mapLeft((error) => errorToReflectionErrors(error, parsedFile.source.filePath)),
    ),
  );
}

function errorToReflectionErrors(error: Error, filePath: string): ReflectionErrors {
  return new ReflectionErrors([new ReflectionError(filePath, error.message)]);
}

function addFileMetadataToTypeAnnotation(type: Type, metadata: string | null): E.Either<Error, Type> {
  const concatAnnotationToType = apply(concatAnnotations, type);

  return pipe(
    O.fromNullable(metadata),
    O.map(concatAnnotationToType),
    O.getOrElse(() => E.right(type)),
  );
}

function concatAnnotations(type: Type, metadataInput: string): E.Either<Error, Type> {
  return pipe(
    metadataInput,
    parseApexMetadata,
    E.map((metadataMap) => ({
      ...type,
      annotations: [...type.annotations, ...mapToAnnotations(metadataMap)],
    })),
  );
}

function mapToAnnotations(metadata: Map<string, string>): Annotation[] {
  return Array.from(metadata.entries()).map(([key, value]) => {
    const declaration = `${key}: ${value}`;
    return {
      name: declaration,
      type: declaration,
      rawDeclaration: declaration,
    };
  });
}
