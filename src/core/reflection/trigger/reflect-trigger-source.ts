import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import * as A from 'fp-ts/lib/Array';
import { reflectTrigger as mirrorReflection, TriggerMirror } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';
import { ParsingError } from '@cparra/apex-reflection';
import { apply } from '#utils/fp';
import { Semigroup } from 'fp-ts/Semigroup';
import { ParsedFile } from '../../shared/types';
import { ReflectionError, ReflectionErrors } from '../../errors/errors';
import { noopReflectionDebugLogger, type ReflectionDebugLogger } from '../apex/reflect-apex-source';

import { UnparsedTriggerBundle } from '../../shared/types';

export type TriggerMetadata = TriggerMirror & {
  type_name: 'trigger';
};

export function reflectTriggerSource(
  triggerBundles: UnparsedTriggerBundle[],
  debugLogger: ReflectionDebugLogger = noopReflectionDebugLogger,
) {
  const semiGroupReflectionError: Semigroup<ReflectionErrors> = {
    concat: (x, y) => new ReflectionErrors([...x.errors, ...y.errors]),
  };
  const Ap = TE.getApplicativeTaskValidation(T.ApplyPar, semiGroupReflectionError);

  return pipe(
    triggerBundles,
    A.traverse(Ap)((bundle) => reflectBundle(bundle, debugLogger)),
  );
}

function reflectBundle(
  triggerBundle: UnparsedTriggerBundle,
  debugLogger: ReflectionDebugLogger,
): TE.TaskEither<ReflectionErrors, ParsedFile<TriggerMetadata>> {
  const convertToParsedFile: (triggerMirror: TriggerMirror) => ParsedFile<TriggerMetadata> = apply(
    toParsedFile,
    triggerBundle.filePath,
  );

  debugLogger.onStart(triggerBundle.filePath);

  return pipe(
    triggerBundle,
    reflectAsTask,
    TE.map((triggerMirror) => {
      debugLogger.onSuccess(triggerBundle.filePath);
      return triggerMirror;
    }),
    TE.map(convertToParsedFile),
    TE.mapLeft((errs) => {
      const msg = errs.errors.map((e) => e.message).join(' | ');
      debugLogger.onFailure(triggerBundle.filePath, msg);
      return errs;
    }),
  );
}

function toParsedFile(filePath: string, triggerMirror: TriggerMirror): ParsedFile<TriggerMetadata> {
  return {
    source: {
      filePath: filePath,
      name: triggerMirror.name,
      type: 'trigger' as const,
    },
    type: {
      ...triggerMirror,
      type_name: 'trigger',
    },
  };
}

function reflectAsTask(triggerContent: UnparsedTriggerBundle): TE.TaskEither<ReflectionErrors, TriggerMirror> {
  return TE.tryCatch(
    () => reflect(triggerContent.content),
    (error) =>
      new ReflectionErrors([new ReflectionError(triggerContent.filePath, (error as ParsingError | Error).message)]),
  );
}

async function reflect(triggerContent: string): Promise<TriggerMirror> {
  const reflectionResult = mirrorReflection(triggerContent);
  if (reflectionResult.error) {
    throw reflectionResult.error;
  }

  return reflectionResult.triggerMirror!;
}
