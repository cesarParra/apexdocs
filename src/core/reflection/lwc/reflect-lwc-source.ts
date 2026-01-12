import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import * as A from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/function';
import { Semigroup } from 'fp-ts/Semigroup';
import { ParsedFile } from '../../shared/types';
import { ReflectionError, ReflectionErrors } from '../../errors/errors';
import * as E from 'fp-ts/Either';

import { UnparsedLightningComponentBundle } from '../../shared/types';
import { XMLParser } from 'fast-xml-parser';
import { noopReflectionDebugLogger, type ReflectionDebugLogger } from '../apex/reflect-apex-source';

export type LwcMetadata = {
  type_name: 'lwc';
  name: string;
} & LightningComponentBundle;

type LightningComponentBundle = {
  isExposed: boolean;
  description?: string;
  masterLabel: string;
  targets?: Target;
  targetConfigs?: TargetConfigs;
};

type Target = {
  target: string[];
};

type TargetConfigs = {
  targetConfig: TargetConfig[] | undefined;
};

export type TargetConfig = {
  property:
    | {
        '@_name': string;
        '@_type': string;
        '@_required'?: boolean;
        '@_label'?: string;
        '@_description'?: string;
      }[]
    | undefined;
  '@_targets': string;
};

export function reflectLwcSource(
  triggerBundles: UnparsedLightningComponentBundle[],
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
  lwcBundle: UnparsedLightningComponentBundle,
  debugLogger: ReflectionDebugLogger,
): TE.TaskEither<ReflectionErrors, ParsedFile<LwcMetadata>> {
  debugLogger.onStart(lwcBundle.filePath);

  return pipe(
    E.tryCatch(() => {
      const alwaysArray = [
        'LightningComponentBundle.targets.target',
        'LightningComponentBundle.targetConfigs.targetConfig',
        'LightningComponentBundle.targetConfigs.targetConfig.property',
      ];

      const options = {
        ignoreAttributes: false,
        isArray: (_name: string, jpath: string) => {
          return alwaysArray.indexOf(jpath) !== -1;
        },
      };
      const result = new XMLParser(options).parse(lwcBundle.metadataContent);
      const bundle = result['LightningComponentBundle'] as LightningComponentBundle;
      return transformBooleanProperties(bundle);
    }, E.toError),
    E.map((parsed) => {
      debugLogger.onSuccess(lwcBundle.filePath);
      return parsed;
    }),
    E.map((parsed) => toParsedFile(lwcBundle.filePath, lwcBundle.name, parsed)),
    E.mapLeft((error) => {
      debugLogger.onFailure(lwcBundle.filePath, error.message);
      return new ReflectionErrors([new ReflectionError(lwcBundle.filePath, error.message)]);
    }),
    TE.fromEither,
  );
}

function transformBooleanProperties(bundle: LightningComponentBundle): LightningComponentBundle {
  // Convert string boolean values to actual booleans in targetConfigs
  if (bundle.targetConfigs?.targetConfig) {
    bundle.targetConfigs.targetConfig = bundle.targetConfigs.targetConfig.map((config) => {
      if (config.property) {
        config.property = config.property.map((prop) => {
          if (typeof prop['@_required'] === 'string') {
            if (prop['@_required'] === 'true') {
              prop['@_required'] = true;
            } else if (prop['@_required'] === 'false') {
              prop['@_required'] = false;
            }
          }
          return prop;
        });
      }
      return config;
    });
  }
  return bundle;
}

function toParsedFile(filePath: string, name: string, bundle: LightningComponentBundle): ParsedFile<LwcMetadata> {
  return {
    source: {
      filePath,
      name: name,
      type: 'lwc',
    },
    type: {
      name: name,
      type_name: 'lwc',
      ...bundle,
    },
  };
}
