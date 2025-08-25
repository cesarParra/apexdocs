import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import * as A from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/function';
import { Semigroup } from 'fp-ts/Semigroup';
import { ParsedFile } from '../../shared/types';
import { ReflectionErrors } from '../../errors/errors';

import { UnparsedLightningComponentBundle } from 'src/core/shared/types';

// TODO: Everything else
export type LwcMetadata = {
  description: string | null;
  type_name: 'lwc';
  name: string;
};

export function reflectLwcSource(triggerBundles: UnparsedLightningComponentBundle[]) {
  const semiGroupReflectionError: Semigroup<ReflectionErrors> = {
    concat: (x, y) => new ReflectionErrors([...x.errors, ...y.errors]),
  };
  const Ap = TE.getApplicativeTaskValidation(T.ApplyPar, semiGroupReflectionError);

  return pipe(triggerBundles, A.traverse(Ap)(reflectBundle));
}

function reflectBundle(
  lwcBundle: UnparsedLightningComponentBundle,
): TE.TaskEither<ReflectionErrors, ParsedFile<LwcMetadata>> {
  function toParsedFile(filePath: string, metadata: LwcMetadata): ParsedFile<LwcMetadata> {
    return {
      source: {
        filePath,
        name: metadata.name,
        type: metadata.type_name,
      },
      type: metadata,
    };
  }

  return TE.right(toParsedFile(lwcBundle.filePath, {
    // TODO: Extract description from jsdoc
    description: null,
    type_name: 'lwc',
    name: lwcBundle.name,
  }));
}
