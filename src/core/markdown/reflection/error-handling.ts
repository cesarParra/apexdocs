import * as E from 'fp-ts/Either';
import { ParsedFile } from '../../shared/types';
import { pipe } from 'fp-ts/function';

export class ReflectionError {
  constructor(
    public file: string,
    public message: string,
  ) {}
}

export function checkForReflectionErrors(reflectionResult: E.Either<ReflectionError, ParsedFile>[]) {
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

  return pipe(reflectionResult, reduceReflectionResultIntoSingleEither, ({ errors, parsedFiles }) =>
    errors.length ? E.left(errors) : E.right(parsedFiles),
  );
}
