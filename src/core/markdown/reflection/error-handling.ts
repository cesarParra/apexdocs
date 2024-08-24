import * as E from 'fp-ts/Either';
import { ParsedFile } from '../../shared/types';
import { pipe } from 'fp-ts/function';

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

export function checkForReflectionErrors(reflectionResult: E.Either<ReflectionError, ParsedFile>[]) {
  return pipe(reflectionResult, reduceReflectionResultIntoSingleEither, toEither);
}

function reduceReflectionResultIntoSingleEither(results: E.Either<ReflectionError, ParsedFile>[]): {
  errors: ReflectionError[];
  parsedFiles: ParsedFile[];
} {
  return results.reduce<{ errors: ReflectionError[]; parsedFiles: ParsedFile[] }>(
    (acc, result) => {
      E.isLeft(result) ? acc.errors.push(result.left) : acc.parsedFiles.push(result.right);
      return acc;
    },
    {
      errors: [],
      parsedFiles: [],
    },
  );
}

function toEither({
  errors,
  parsedFiles,
}: {
  errors: ReflectionError[];
  parsedFiles: ParsedFile[];
}): E.Either<ReflectionErrors, ParsedFile[]> {
  return errors.length ? E.left(new ReflectionErrors(errors)) : E.right(parsedFiles);
}
