import { ParsedFile, UnparsedCustomObjectBundle } from '../../shared/types';
import { XMLParser } from 'fast-xml-parser';
import * as TE from 'fp-ts/TaskEither';
import { ReflectionError, ReflectionErrors } from '../../errors/errors';
import { Semigroup } from 'fp-ts/Semigroup';
import * as T from 'fp-ts/Task';
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { CustomFieldMetadata } from './reflect-custom-field-source';
import { getPickListValues } from './parse-picklist-values';
import { CustomMetadataMetadata } from './reflect-custom-metadata-source';

export type PublishBehavior = 'PublishImmediately' | 'PublishAfterCommit';

export type CustomObjectMetadata = {
  type_name: 'customobject';
  deploymentStatus: string;
  visibility: string;
  label?: string | null;
  name: string;
  description: string | null;
  fields: CustomFieldMetadata[];
  metadataRecords: CustomMetadataMetadata[];
  publishBehavior?: PublishBehavior;
};

export function reflectCustomObjectSources(
  objectBundles: UnparsedCustomObjectBundle[],
): TE.TaskEither<ReflectionErrors, ParsedFile<CustomObjectMetadata>[]> {
  const semiGroupReflectionError: Semigroup<ReflectionErrors> = {
    concat: (x, y) => new ReflectionErrors([...x.errors, ...y.errors]),
  };
  const Ap = TE.getApplicativeTaskValidation(T.ApplyPar, semiGroupReflectionError);

  return pipe(objectBundles, A.traverse(Ap)(reflectCustomObjectSource));
}

function reflectCustomObjectSource(
  objectSource: UnparsedCustomObjectBundle,
): TE.TaskEither<ReflectionErrors, ParsedFile<CustomObjectMetadata>> {
  return pipe(
    E.tryCatch(() => new XMLParser().parse(objectSource.content), E.toError),
    E.flatMap(validate),
    E.map(toObjectMetadata),
    E.map((metadata) => addName(metadata, objectSource.name)),
    E.map(parseInlineFields),
    E.map(addTypeName),
    E.map((metadata) => toParsedFile(objectSource.filePath, metadata)),
    E.mapLeft((error) => new ReflectionErrors([new ReflectionError(objectSource.filePath, error.message)])),
    TE.fromEither,
  );
}

function validate(parseResult: unknown): E.Either<Error, { CustomObject: unknown }> {
  const err = E.left(new Error('Invalid SObject metadata'));

  function isObject(value: unknown) {
    return typeof value === 'object' && value !== null ? E.right(value) : err;
  }

  function hasTheCustomObjectKey(value: object) {
    return 'CustomObject' in value ? E.right(value) : err;
  }

  return pipe(parseResult, isObject, E.chain(hasTheCustomObjectKey));
}

function toObjectMetadata(parserResult: { CustomObject: unknown }): CustomObjectMetadata {
  const customObject = typeof parserResult.CustomObject === 'object' ? parserResult.CustomObject : {};

  const defaultValues: Partial<CustomObjectMetadata> = {
    deploymentStatus: 'Deployed',
    visibility: 'Public',
    description: null,
    fields: [] as CustomFieldMetadata[],
    metadataRecords: [] as CustomMetadataMetadata[],
  };
  return { ...defaultValues, ...customObject } as CustomObjectMetadata;
}

function addName(objectMetadata: CustomObjectMetadata, name: string): CustomObjectMetadata {
  return {
    ...objectMetadata,
    name,
  };
}

function parseInlineFields(metadata: CustomObjectMetadata): CustomObjectMetadata {
  // if "fields" is present, it might be a single object (if it only has one field)
  // or an array
  if (!Array.isArray(metadata.fields)) {
    metadata.fields = [metadata.fields];
  }

  return {
    ...metadata,
    fields: metadata.fields.map((field) => convertInlineFieldsToCustomFieldMetadata(field, metadata.name)),
  };
}

function convertInlineFieldsToCustomFieldMetadata(
  inlineField: Record<string, unknown>,
  parentName: string,
): CustomFieldMetadata {
  // Based on Salesforce's documentation, the only required field is "fullName"
  const name = inlineField.fullName as string;
  const description = inlineField.description ? (inlineField.description as string) : null;
  const label = inlineField.label ? (inlineField.label as string) : name;
  const type = inlineField.type ? (inlineField.type as string) : null;
  const required = inlineField.required ? (inlineField.required as boolean) : false;
  const securityClassification = inlineField.securityClassification ? (inlineField.securityClassification as string) : null;
  const complianceGroup = inlineField.complianceGroup ? (inlineField.complianceGroup as string) : null;

  return {
    type_name: 'customfield',
    description,
    label,
    name,
    parentName,
    type,
    required,
    securityClassification,
    complianceGroup,
    pickListValues: getPickListValues(inlineField),
  };
}

function addTypeName(objectMetadata: CustomObjectMetadata): CustomObjectMetadata {
  return {
    ...objectMetadata,
    type_name: 'customobject',
  };
}

function toParsedFile(filePath: string, typeMirror: CustomObjectMetadata): ParsedFile<CustomObjectMetadata> {
  return {
    source: {
      filePath: filePath,
      name: typeMirror.name,
      type: typeMirror.type_name,
    },
    type: typeMirror,
  };
}
