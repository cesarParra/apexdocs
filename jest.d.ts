declare namespace jest {
  interface Matchers<R> {
    documentationBundleHasLength(length: number): R;
    firstDocContains(content: string): R;
    firstDocContainsNot(content: string): R;
  }
}

declare module '*.md' {
  const styles: {
    html: string;
    filename: string;
    path: string;
    metadata: Record<string, string>;
  };

  export default styles;
}
