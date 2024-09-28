export class ReflectionError {
  constructor(
    public file: string,
    public message: string,
  ) {}
}

export class ReflectionErrors {
  readonly _tag = 'ReflectionErrors';

  constructor(public errors: ReflectionError[]) {}
}

export class HookError {
  readonly _tag = 'HookError';

  constructor(public error: unknown) {}
}
