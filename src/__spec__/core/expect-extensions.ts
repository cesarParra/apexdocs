import * as E from 'fp-ts/Either';
import { DocumentationBundle } from '../../core/shared/types';

export function extendExpect() {
  expect.extend({
    documentationBundleHasLength(received: E.Either<string[], DocumentationBundle>, length: number) {
      return {
        pass: E.isRight(received) && received.right.docs.length === length,
        message: () => `Expected documentation bundle to have length ${length}`,
      };
    },
    firstDocContains(doc: DocumentationBundle, content: string) {
      return {
        pass: doc.docs[0].content.includes(content),
        message: () => `Expected documentation to contain ${content}. Got ${doc.docs[0].content}`,
      };
    },
    firstDocContainsNot(doc: DocumentationBundle, content: string) {
      return {
        pass: !doc.docs[0].content.includes(content),
        message: () => `Expected documentation to not contain ${content}. Got ${doc.docs[0].content}`,
      };
    },
  });
}

export function assertEither<T, U>(result: E.Either<T, U>, assertion: (data: U) => void): void {
  E.match<T, U, void>(
    (error) => fail(error),
    (data) => assertion(data),
  )(result);
}
