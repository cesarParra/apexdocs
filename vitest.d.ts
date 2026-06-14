import 'vitest';

interface CustomMatchers<R = unknown> {
  documentationBundleHasLength(length: number): R;
  firstDocContains(content: string): R;
  firstDocContainsNot(content: string): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Matchers<T = any> extends CustomMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
