import { ParsedFile, SourceFile } from '../../shared/types';
import * as E from 'fp-ts/Either';
import { reflect as mirrorReflection, Type } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { parseApexMetadata } from '../../parse-apex-metadata';
import { ReflectionError } from './error-handling';

export function reflectSourceCode(apexBundles: SourceFile[]) {
  return apexBundles.map(reflectSourceBody);
}

function reflectSourceBody(apexBundle: SourceFile): E.Either<ReflectionError, ParsedFile> {
  const { filePath, content: input, metadataContent: metadata } = apexBundle;
  const result = mirrorReflection(input);
  return result.error
    ? E.left(new ReflectionError(filePath, result.error.message))
    : E.right({
        filePath,
        type: addFileMetadataToTypeAnnotation(result.typeMirror!, metadata),
      });
}

function addFileMetadataToTypeAnnotation(type: Type, metadata: string | null): Type {
  return pipe(
    O.fromNullable(metadata),
    O.map((metadata) => {
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
