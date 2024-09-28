export class FileReadingError {
  readonly _tag = 'FileReadingError';

  constructor(
    public message: string,
    public error: unknown,
  ) {}
}

export class FileWritingError {
  readonly _tag = 'FileWritingError';

  constructor(
    public message: string,
    public error: unknown,
  ) {}
}
