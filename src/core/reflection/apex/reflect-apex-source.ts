import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as A from 'fp-ts/lib/Array';
import { Annotation, ParsingError, reflect as mirrorReflection, Type } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { apply } from '#utils/fp';
import { Semigroup } from 'fp-ts/Semigroup';
import { ParsedFile, UnparsedApexBundle, UserDefinedMarkdownConfig } from '../../shared/types';
import { ReflectionError, ReflectionErrors } from '../../errors/errors';
import { parseApexMetadata } from './parse-apex-metadata';
import { isInSource } from '../../shared/utils';
import { Worker } from 'node:worker_threads';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { WorkerPool } from '#utils/worker-pool';

export type ReflectionWithRecoverableErrors<T> = {
  successes: T;
  errors: ReflectionErrors;
};

export type ReflectionDebugLogger = {
  onSuccess: (filePath: string) => void;
  onFailure: (filePath: string, errorMessage: string) => void;
};

export const noopReflectionDebugLogger: ReflectionDebugLogger = {
  onSuccess: () => {},
  onFailure: () => {},
};

const noopDebugLogger: ReflectionDebugLogger = noopReflectionDebugLogger;

async function reflectAsync(rawSource: string): Promise<Type> {
  return new Promise((resolve, reject) => {
    const result = mirrorReflection(rawSource);
    if (result.typeMirror) {
      return resolve(result.typeMirror);
    } else if (result.error) {
      return reject(result.error);
    } else {
      return reject(new Error('Unknown error'));
    }
  });
}

function supportsWorkerThreads(): boolean {
  // Some test runners / bundlers may not support worker threads in their environment.
  try {
    return typeof Worker === 'function';
  } catch {
    return false;
  }
}

function isWorkerReflectionEnabled(config?: Pick<UserDefinedMarkdownConfig, 'parallelReflection'>): boolean {
  // Enabled by default via config (markdownDefaults.parallelReflection === true).
  const env = (process.env.APEXDOCS_WORKER_REFLECTION ?? '').toLowerCase();
  if (env === 'true' || env === '1') {
    return true;
  }
  if (env === 'false' || env === '0') {
    return false;
  }

  // Default to true if config isn't provided.
  return config?.parallelReflection ?? true;
}

function getWorkerEntrypointPath(): string {
  // The worker entrypoint is emitted as a standalone JS file during build at:
  //   dist/apex-reflection.worker.js
  //
  // We resolve it relative to this module by walking up to the dist root.
  const candidate = path.resolve(__dirname, './apex-reflection.worker.js');
  if (fs.existsSync(candidate)) {
    return candidate;
  }

  // Keep a deterministic path in the error message.
  return candidate;
}

function toRecoverableResult<T>(successes: T, errors: ReflectionErrors): ReflectionWithRecoverableErrors<T> {
  return { successes, errors };
}

function errorMessageFromUnknown(err: unknown): string {
  if (err instanceof Error) return err.message;
  const msg = (err as { message?: unknown } | null | undefined)?.message;
  return typeof msg === 'string' ? msg : String(err);
}
export function reflectApexSourceBestEffort(
  apexBundles: UnparsedApexBundle[],
  config?: Pick<UserDefinedMarkdownConfig, 'parallelReflection' | 'parallelReflectionMaxWorkers'>,
  debugLogger: ReflectionDebugLogger = noopDebugLogger,
): TE.TaskEither<ReflectionErrors, ReflectionWithRecoverableErrors<ParsedFile<Type>[]>> {
  const semiGroupReflectionError: Semigroup<ReflectionErrors> = {
    concat: (x, y) => new ReflectionErrors([...x.errors, ...y.errors]),
  };
  const Ap = TE.getApplicativeTaskValidation(T.ApplyPar, semiGroupReflectionError);

  if (!isWorkerReflectionEnabled(config) || !supportsWorkerThreads()) {
    return pipe(
      apexBundles,
      A.traverse(Ap)((bundle) => {
        return pipe(
          reflectBundle(bundle),
          TE.map((parsed) => {
            debugLogger.onSuccess(bundle.filePath);
            return parsed;
          }),
          TE.mapLeft((errs) => {
            const msg = errs.errors.map((e) => e.message).join(' | ');
            debugLogger.onFailure(bundle.filePath, msg);
            return errs;
          }),
        );
      }),
      TE.map((parsed) => toRecoverableResult(parsed, new ReflectionErrors([]))),
    );
  }

  return pipe(
    TE.tryCatch(
      async () => {
        // Default: cap to 8 to avoid over-saturating smaller machines while still getting meaningful speedups.
        const cpu = os.cpus()?.length ?? 1;
        const defaultMax = Math.max(1, Math.min(cpu, 8));
        const maxWorkers = Math.max(1, config?.parallelReflectionMaxWorkers ?? defaultMax);

        const pool = new WorkerPool(() => new Worker(getWorkerEntrypointPath()), {
          maxWorkers,
        });

        try {
          const results = await Promise.allSettled(
            apexBundles.map(async (bundle) => {
              return await pool.run<{ content: string }, Type>({ content: bundle.content });
            }),
          );

          const errors: ReflectionError[] = [];
          const successes: Array<{ t: Type; idx: number }> = [];

          results.forEach((r, idx) => {
            if (r.status === 'fulfilled') {
              debugLogger.onSuccess(apexBundles[idx].filePath);
              successes.push({ t: r.value, idx });
              return;
            }

            const msg = errorMessageFromUnknown(r.reason);
            debugLogger.onFailure(apexBundles[idx].filePath, msg);
            errors.push(new ReflectionError(apexBundles[idx].filePath, msg));
          });

          return toRecoverableResult(successes, new ReflectionErrors(errors));
        } finally {
          await pool.terminate();
        }
      },
      (error) => {
        const message = (error as Error | { message?: unknown })?.message;
        return new ReflectionErrors([
          new ReflectionError('', typeof message === 'string' ? message : 'Worker failure'),
        ]);
      },
    ),
    TE.mapLeft((errs) => errs),
    TE.flatMap((recoverableOrPairs) => {
      const recoverable = recoverableOrPairs as unknown as ReflectionWithRecoverableErrors<
        Array<{ t: Type; idx: number }>
      >;

      const parsedTasks = recoverable.successes.map(({ t, idx }) => {
        const bundle = apexBundles[idx];
        const convertToParsedFile: (typeMirror: Type) => ParsedFile<Type> = apply(toParsedFile, bundle.filePath);
        const withMetadata = apply(addMetadata, bundle.metadataContent);
        return pipe(TE.right(t), TE.map(convertToParsedFile), TE.flatMap(withMetadata));
      });

      return pipe(
        parsedTasks,
        A.sequence(Ap),
        TE.map((parsed) => toRecoverableResult(parsed, recoverable.errors)),
      );
    }),
  );
}

function reflectBundle(apexBundle: UnparsedApexBundle): TE.TaskEither<ReflectionErrors, ParsedFile<Type>> {
  const convertToParsedFile: (typeMirror: Type) => ParsedFile<Type> = apply(toParsedFile, apexBundle.filePath);
  const withMetadata = apply(addMetadata, apexBundle.metadataContent);

  return pipe(apexBundle, reflectAsTask, TE.map(convertToParsedFile), TE.flatMap(withMetadata));
}

function reflectAsTask(apexBundle: UnparsedApexBundle): TE.TaskEither<ReflectionErrors, Type> {
  return TE.tryCatch(
    () => reflectAsync(apexBundle.content),
    (error) =>
      new ReflectionErrors([new ReflectionError(apexBundle.filePath, (error as ParsingError | Error).message)]),
  );
}

function toParsedFile(filePath: string, typeMirror: Type): ParsedFile<Type> {
  return {
    source: {
      filePath: filePath,
      name: typeMirror.name,
      type: typeMirror.type_name,
    },
    type: typeMirror,
  };
}

function addMetadata(
  rawMetadataContent: string | null,
  parsedFile: ParsedFile<Type>,
): TE.TaskEither<ReflectionErrors, ParsedFile<Type>> {
  return TE.fromEither(
    pipe(
      parsedFile.type,
      (type) => addFileMetadataToTypeAnnotation(type as Type, rawMetadataContent),
      E.map((type) => ({ ...parsedFile, type })),
      E.mapLeft((error) =>
        errorToReflectionErrors(error, isInSource(parsedFile.source) ? parsedFile.source.filePath : ''),
      ),
    ),
  );
}

function errorToReflectionErrors(error: Error, filePath: string): ReflectionErrors {
  return new ReflectionErrors([new ReflectionError(filePath, error.message)]);
}

function addFileMetadataToTypeAnnotation(type: Type, metadata: string | null): E.Either<Error, Type> {
  const concatAnnotationToType = apply(concatAnnotations, type);

  return pipe(
    O.fromNullable(metadata),
    O.map(concatAnnotationToType),
    O.getOrElse(() => E.right(type)),
  );
}

function concatAnnotations(type: Type, metadataInput: string): E.Either<Error, Type> {
  return pipe(
    metadataInput,
    parseApexMetadata,
    E.map((metadataMap) => ({
      ...type,
      annotations: [...type.annotations, ...mapToAnnotations(metadataMap)],
    })),
  );
}

function mapToAnnotations(metadata: Map<string, string>): Annotation[] {
  return Array.from(metadata.entries()).map(([key, value]) => {
    const declaration = `${key}: ${value}`;
    return {
      name: declaration,
      type: declaration,
      rawDeclaration: declaration,
    };
  });
}
