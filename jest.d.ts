declare namespace jest {
  interface Matchers<R> {
    documentationBundleHasLength(length: number): R;
    firstDocContains(content: string): R;
  }
}
