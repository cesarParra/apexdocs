import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import * as A from 'fp-ts/lib/Array';
import { reflectTriggerAsync as mirrorReflection, TriggerMirror } from '@cparra/apex-reflection';
import { pipe } from 'fp-ts/function';
import { ParsingError } from '@cparra/apex-reflection';
import { apply } from '#utils/fp';
import { Semigroup } from 'fp-ts/Semigroup';
import { ParsedFile } from '../../shared/types';
import { ReflectionError, ReflectionErrors } from '../../errors/errors';

import { UnparsedTriggerBundle } from 'src/core/shared/types';

export type TriggerMetadata = TriggerMirror & {
  type_name: 'trigger';
};

export function reflectTriggerSource(triggerBundles: UnparsedTriggerBundle[]) {
  const semiGroupReflectionError: Semigroup<ReflectionErrors> = {
    concat: (x, y) => new ReflectionErrors([...x.errors, ...y.errors]),
  };
  const Ap = TE.getApplicativeTaskValidation(T.ApplyPar, semiGroupReflectionError);

  return pipe(triggerBundles, A.traverse(Ap)(reflectBundle));
}

function reflectBundle(
  triggerBundle: UnparsedTriggerBundle,
): TE.TaskEither<ReflectionErrors, ParsedFile<TriggerMetadata>> {
  const convertToParsedFile: (triggerMirror: TriggerMirror) => ParsedFile<TriggerMetadata> = apply(
    toParsedFile,
    triggerBundle.filePath,
  );

  return pipe(triggerBundle, reflectAsTask, TE.map(convertToParsedFile));
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
    () => reflectAsync(triggerContent.content),
    (error) =>
      new ReflectionErrors([new ReflectionError(triggerContent.filePath, (error as ParsingError | Error).message)]),
  );
}

async function reflectAsync(triggerContent: string): Promise<TriggerMirror> {
  const reflectionResult = await mirrorReflection(triggerContent);
  if (reflectionResult.error) {
    throw reflectionResult.error;
  }

  return reflectionResult.triggerMirror!;
}
