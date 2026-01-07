import { ParsedFile, UnparsedCustomFieldBundle } from '../../shared/types';
import { ReflectionError, ReflectionErrors } from '../../errors/errors';
import { Semigroup } from 'fp-ts/Semigroup';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import { XMLParser } from 'fast-xml-parser';
import * as E from 'fp-ts/Either';
import { getPickListValues } from './parse-picklist-values';
import { noopReflectionDebugLogger, type ReflectionDebugLogger } from '../apex/reflect-apex-source';

export type CustomFieldMetadata = {
  type_name: 'customfield';
  description: string | null;
  name: string;
  label?: string | null;
  type?: string | null;
  parentName: string;
  pickListValues?: string[];
  required: boolean;
  securityClassification: string | null;
  complianceGroup: string | null;
  inlineHelpText: string | null;
};

export function reflectCustomFieldSources(
  customFieldSources: UnparsedCustomFieldBundle[],
  debugLogger: ReflectionDebugLogger = noopReflectionDebugLogger,
): TE.TaskEither<ReflectionErrors, ParsedFile<CustomFieldMetadata>[]> {
  const semiGroupReflectionError: Semigroup<ReflectionErrors> = {
    concat: (x, y) => new ReflectionErrors([...x.errors, ...y.errors]),
  };
  const Ap = TE.getApplicativeTaskValidation(T.ApplyPar, semiGroupReflectionError);

  return pipe(
    customFieldSources,
    A.traverse(Ap)((bundle) => reflectCustomFieldSource(bundle, debugLogger)),
  );
}

function reflectCustomFieldSource(
  customFieldSource: UnparsedCustomFieldBundle,
  debugLogger: ReflectionDebugLogger,
): TE.TaskEither<ReflectionErrors, ParsedFile<CustomFieldMetadata>> {
  debugLogger.onStart(customFieldSource.filePath);

  return pipe(
    E.tryCatch(() => new XMLParser().parse(customFieldSource.content), E.toError),
    E.flatMap(validate),
    E.map(toCustomFieldMetadata),
    E.map((metadata) => addName(metadata, customFieldSource.name)),
    E.map((metadata) => addParentName(metadata, customFieldSource.parentName)),
    E.map((metadata) => toParsedFile(customFieldSource.filePath, metadata)),
    E.map((parsed) => {
      debugLogger.onSuccess(customFieldSource.filePath);
      return parsed;
    }),
    E.mapLeft((error) => {
      debugLogger.onFailure(customFieldSource.filePath, error.message);
      return new ReflectionErrors([new ReflectionError(customFieldSource.filePath, error.message)]);
    }),
    TE.fromEither,
  );
}

function validate(parsedResult: unknown): E.Either<Error, { CustomField: unknown }> {
  const err = E.left(new Error('Invalid custom field metadata'));

  function isObject(value: unknown) {
    return typeof value === 'object' && value !== null ? E.right(value) : err;
  }

  function hasTheCustomFieldKey(value: object) {
    return 'CustomField' in value ? E.right(value) : err;
  }

  return pipe(parsedResult, isObject, E.chain(hasTheCustomFieldKey));
}

function toCustomFieldMetadata(parserResult: { CustomField: unknown }): CustomFieldMetadata {
  const customField =
    parserResult?.CustomField != null && typeof parserResult.CustomField === 'object' ? parserResult.CustomField : {};
  const defaultValues = {
    description: null,
    required: false,
    securityClassification: null,
    complianceGroup: null,
    inlineHelpText: null,
  };

  return {
    ...defaultValues,
    ...customField,
    type_name: 'customfield',
    pickListValues: getPickListValues(customField),
  } as CustomFieldMetadata;
}

function addName(metadata: CustomFieldMetadata, name: string): CustomFieldMetadata {
  return { ...metadata, name };
}

function addParentName(metadata: CustomFieldMetadata, parentName: string): CustomFieldMetadata {
  return { ...metadata, parentName };
}

function toParsedFile(filePath: string, typeMirror: CustomFieldMetadata): ParsedFile<CustomFieldMetadata> {
  return {
    source: {
      filePath,
      name: typeMirror.name,
      type: typeMirror.type_name,
    },
    type: typeMirror,
  };
}
