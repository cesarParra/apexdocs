import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import * as A from 'fp-ts/lib/Array';
import { pipe } from 'fp-ts/function';
import { Semigroup } from 'fp-ts/Semigroup';
import { ParsedFile } from '../../shared/types';
import { ReflectionError, ReflectionErrors } from '../../errors/errors';
import * as E from 'fp-ts/Either';
import { parse as babelParser, } from '@babel/parser';
import { Statement, type ClassDeclaration, type ClassBody } from '@babel/types';
import { match } from 'ts-pattern';

import { UnparsedLightningComponentBundle } from 'src/core/shared/types';
import { XMLParser } from 'fast-xml-parser';

type ParsedJs = {
  properties: {
    name: string;
  }[];
  className: string;
};

export type LwcMetadata = {
  type_name: 'lwc';
  name: string;
  parsed: ParsedJs
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
  return pipe(
    E.tryCatch(() => parse(lwcBundle), E.toError),
    E.map((parsed) => toParsedFile(lwcBundle.filePath, lwcBundle.name, parsed)),
    E.mapLeft((error) => new ReflectionErrors([new ReflectionError(lwcBundle.filePath, error.message)])),
    TE.fromEither,
  );
}

function parse(lwcBundle: UnparsedLightningComponentBundle): [ParsedJs, LightningComponentBundle] {
  return [parseJsContent(lwcBundle.content), parseLwcMetadataXml(lwcBundle)];
}

type ApiProperty = { name: string };
type Match = { type: 'match', data: ParsedJs };
type NoMatch = { type: 'no_match' };

type MatchedClass = Match | NoMatch;

//function parseJsContent(content: string): E.Either<string, ParsedJs> {
function parseJsContent(content: string): ParsedJs {
  const parsed = babelParser(content, {
    sourceType: 'module',
    plugins: ['decorators'],
  });

  function walk(statement: Statement) {
    function getApiProperties(body: ClassBody): ApiProperty[] {
      return body.body
        .filter((something) => something.type === 'ClassProperty')
        .filter(property => property.decorators && property.decorators.length > 0)
        .filter(property => property.decorators!.some(decorator => {
          return decorator.expression.type === 'Identifier' && decorator.expression.name === 'api';
        }))
        .map(property => property.key)
        .filter(key => key.type === 'Identifier')
        .map(({name}) => ({ name }));
    }

    function matchedClassDeclaration({ declaration }: { declaration: ClassDeclaration }): MatchedClass {
      return {
        type: 'match',
        data: { className: declaration.id!.name, properties: getApiProperties(declaration.body) }
      };
    }

    return match(statement)
      .returnType<MatchedClass>()
      .with(
        { type: 'ExportDefaultDeclaration', declaration: { type: 'ClassDeclaration' } },
        matchedClassDeclaration
      )
      .otherwise(() => ({ type: 'no_match' }));
  }

  function findClass() {
    const matches = parsed.program.body.map(walk);
    return matches.find((match) => match.type === 'match');
  }

  return findClass()!.data;

  // TODO: Handle potential issues
  //const result = findClass();
  // return match(result)
  //   .returnType<E.Either<string, ParsedJs>>()
  //   .with(undefined, () => E.left('An issue occurred parsing the LWC JS code.'))
  //   .with({ type: 'match' }, (match) => E.right(match.data))
  //   .exhaustive();
}

function parseLwcMetadataXml(lwcBundle: UnparsedLightningComponentBundle) {
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

function toParsedFile(filePath: string, name: string, bundle: [ParsedJs, LightningComponentBundle]): ParsedFile<LwcMetadata> {
  const [parsedJs, metadata] = bundle;

  return {
    source: {
      filePath,
      name: name,
      type: 'lwc',
    },
    type: {
      name: name,
      type_name: 'lwc',
      parsed: parsedJs,
      ...metadata,
    },
  };
}
