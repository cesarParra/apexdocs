import { ParsedFile, UnparsedCustomFieldBundle } from '../../shared/types';
import { ReflectionError, ReflectionErrors } from '../../errors/errors';
import { Semigroup } from 'fp-ts/Semigroup';
import * as TE from 'fp-ts/TaskEither';
import * as T from 'fp-ts/Task';
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import { XMLParser } from 'fast-xml-parser';
import * as E from 'fp-ts/Either';

export type CustomFieldMetadata = {
  type_name: 'customfield';
  description: string | null;
  name: string;
  label: string;
  type: string;
  parentName: string;

  // TODO: Whatever else we want to put around fields
  // TODO: E.g. if it is required, picklist values, etc.
};

export function reflectCustomFieldSources(
  customFieldSources: UnparsedCustomFieldBundle[],
): TE.TaskEither<ReflectionErrors, ParsedFile<CustomFieldMetadata>[]> {
  const semiGroupReflectionError: Semigroup<ReflectionErrors> = {
    concat: (x, y) => new ReflectionErrors([...x.errors, ...y.errors]),
  };
  const Ap = TE.getApplicativeTaskValidation(T.ApplyPar, semiGroupReflectionError);

  return pipe(customFieldSources, A.traverse(Ap)(reflectCustomFieldSource));
}

function reflectCustomFieldSource(
  customFieldSource: UnparsedCustomFieldBundle,
): TE.TaskEither<ReflectionErrors, ParsedFile<CustomFieldMetadata>> {
  return pipe(
    E.tryCatch(() => new XMLParser().parse(customFieldSource.content), E.toError),
    // TODO: Validate
    E.map(toCustomFieldMetadata),
    E.map((metadata) => addName(metadata, customFieldSource.name)),
    E.map((metadata) => addParentName(metadata, customFieldSource.parentName)),
    E.map((metadata) => toParsedFile(customFieldSource.filePath, metadata)),
    E.mapLeft((error) => new ReflectionErrors([new ReflectionError(customFieldSource.filePath, error.message)])),
    TE.fromEither,
  );
}

function toCustomFieldMetadata(parserResult: { CustomField: object }): CustomFieldMetadata {
  const defaultValues = {
    description: null,
  };

  return { ...defaultValues, ...parserResult.CustomField, type_name: 'customfield' } as CustomFieldMetadata;
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
