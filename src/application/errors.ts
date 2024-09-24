export class FileWritingError {
  readonly _tag = 'FileWritingError';

  constructor(
    public message: string,
    public error: unknown,
  ) {}
}
