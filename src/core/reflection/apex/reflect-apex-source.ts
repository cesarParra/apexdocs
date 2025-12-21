import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import * as T from 'fp-ts/Task';
import * as A from 'fp-ts/lib/Array';
import { Annotation, reflect as mirrorReflection, Type } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { ParsingError } from '@cparra/apex-reflection';
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
import { WorkerPool } from '../../../util/worker-pool';

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
  // NOTE: keep env-var override for troubleshooting.
  const env = (process.env.APEXDOCS_WORKER_REFLECTION ?? '').toLowerCase();
  if (env === 'true' || env === '1') return true;
  if (env === 'false' || env === '0') return false;

  // Default to true if config isn't provided.
  return config?.parallelReflection ?? true;
}

function getWorkerEntrypointPath(): string {
  // The worker file is emitted as a standalone JS file during build.
  //
  // Build may place it under either:
  //   dist/core/reflection/apex/apex-reflection.worker.js
  // or (depending on bundler layout / package exports):
  //   dist/core/reflection/apex/apex-reflection.worker.js (but __dirname may be dist/core/reflection/apex/apex/)
  //
  // Because this project is bundled, the runtime location of this file can vary.
  // We resolve relative to this module's directory first, then try a couple dist-root heuristics.
  const candidate1 = path.resolve(__dirname, './apex-reflection.worker.js');
  if (fs.existsSync(candidate1)) {
    return candidate1;
  }

  // Some bundlers may nest source module paths under an extra "apex/" directory at runtime:
  //   .../dist/core/reflection/apex/apex/reflect-*.js
  // while the worker is emitted at:
  //   .../dist/core/reflection/apex/apex-reflection.worker.js
  const candidate1b = path.resolve(__dirname, '../apex-reflection.worker.js');
  if (fs.existsSync(candidate1b)) {
    return candidate1b;
  }

  // Fallback: walk up from this file and probe a few likely dist layouts.
  // This is a best-effort safety net for bundler output layouts.
  let dir = __dirname;
  for (let i = 0; i < 10; i++) {
    // Try treating "dir/../../.." as dist root (existing heuristic)
    const maybeDist1 = path.resolve(dir, '../../..');
    const candidate2a = path.resolve(maybeDist1, 'core', 'reflection', 'apex', 'apex-reflection.worker.js');
    if (fs.existsSync(candidate2a)) {
      return candidate2a;
    }

    // Try one-level-deeper "dist/core/..." layout, in case the runtime file lives under dist/core/...
    // and we need to step to dist/ then append core/...
    const maybeDist2 = path.resolve(dir, '../../../..');
    const candidate2b = path.resolve(maybeDist2, 'core', 'reflection', 'apex', 'apex-reflection.worker.js');
    if (fs.existsSync(candidate2b)) {
      return candidate2b;
    }

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  // Keep a deterministic path in the error message.
  return candidate1;
}

function reflectAsTaskParallel(
  apexBundles: UnparsedApexBundle[],
  config?: Pick<UserDefinedMarkdownConfig, 'parallelReflectionMaxWorkers'>,
): TE.TaskEither<ReflectionErrors, Type[]> {
  return TE.tryCatch(
    async () => {
      // Default: cap to 8 to avoid over-saturating smaller machines while still getting meaningful speedups.
      const cpu = os.cpus()?.length ?? 1;
      const defaultMax = Math.max(1, Math.min(cpu, 8));
      const maxWorkers = Math.max(1, config?.parallelReflectionMaxWorkers ?? defaultMax);

      const pool = new WorkerPool(() => new Worker(getWorkerEntrypointPath()), {
        maxWorkers,
        // Keep default queue size (Infinity) unless we later decide to bound it via config.
      });

      try {
        const results = await Promise.all(
          apexBundles.map(async (bundle) => {
            const typeMirror = await pool.run<{ content: string }, Type>({ content: bundle.content });
            return typeMirror;
          }),
        );
        return results;
      } finally {
        await pool.terminate();
      }
    },
    (error) => {
      // If the pool-level execution fails, surface as a generic reflection error.
      // Individual parse errors are handled per-file in the worker and will be propagated as rejects.
      const message = (error as Error | { message?: unknown })?.message;
      return new ReflectionErrors([new ReflectionError('', typeof message === 'string' ? message : 'Worker failure')]);
    },
  );
}

export function reflectApexSource(
  apexBundles: UnparsedApexBundle[],
  config?: Pick<UserDefinedMarkdownConfig, 'parallelReflection' | 'parallelReflectionMaxWorkers'>,
) {
  const semiGroupReflectionError: Semigroup<ReflectionErrors> = {
    concat: (x, y) => new ReflectionErrors([...x.errors, ...y.errors]),
  };
  const Ap = TE.getApplicativeTaskValidation(T.ApplyPar, semiGroupReflectionError);

  // Parallel by default; configurable via CLI/config and env override.
  if (!isWorkerReflectionEnabled(config) || !supportsWorkerThreads()) {
    return pipe(apexBundles, A.traverse(Ap)(reflectBundle));
  }

  return pipe(
    reflectAsTaskParallel(apexBundles, config),
    TE.map((typeMirrors) => typeMirrors.map((t, idx) => ({ t, idx }))),
    TE.mapLeft((errs) => errs),
    TE.flatMap((pairs) => {
      // Rebuild ParsedFile list and attach per-file metadata sequentially (cheap).
      const parsedTasks = pairs.map(({ t, idx }) => {
        const bundle = apexBundles[idx];
        const convertToParsedFile: (typeMirror: Type) => ParsedFile<Type> = apply(toParsedFile, bundle.filePath);
        const withMetadata = apply(addMetadata, bundle.metadataContent);
        return pipe(TE.right(t), TE.map(convertToParsedFile), TE.flatMap(withMetadata));
      });

      return pipe(parsedTasks, A.sequence(Ap));
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
