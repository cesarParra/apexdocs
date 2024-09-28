import * as E from 'fp-ts/Either';

export function assertEither<T, U>(result: E.Either<T, U>, assertion: (data: U) => void): void {
  E.match<T, U, void>(
    (error) => fail(error),
    (data) => assertion(data),
  )(result);
}

function fail(error: unknown): never {
  throw error;
}
