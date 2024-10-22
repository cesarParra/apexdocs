import { ParsedFile, UnparsedCustomFieldBundle, UnparsedCustomObjectBundle } from '../../shared/types';
import { ObjectMetadata, reflectCustomObjectSources } from './reflect-custom-object-sources';
import * as TE from 'fp-ts/TaskEither';
import { ReflectionErrors } from '../../errors/errors';
import { CustomFieldMetadata, reflectCustomFieldSources } from './reflect-custom-field-source';
import { pipe } from 'fp-ts/function';

export function reflectCustomFieldsAndObjects(objectBundles: (UnparsedCustomObjectBundle | UnparsedCustomFieldBundle)[]) {
  function filterNonPublished(parsedFiles: ParsedFile<ObjectMetadata>[]): ParsedFile<ObjectMetadata>[] {
    return parsedFiles.filter((parsedFile) => parsedFile.type.deploymentStatus === 'Deployed');
  }

  function filterNonPublic(parsedFiles: ParsedFile<ObjectMetadata>[]): ParsedFile<ObjectMetadata>[] {
    return parsedFiles.filter((parsedFile) => parsedFile.type.visibility === 'Public');
  }

  const customObjects = objectBundles.filter(
    (object): object is UnparsedCustomObjectBundle => object.type === 'customobject',
  );

  const customFields = objectBundles.filter(
    (object): object is UnparsedCustomFieldBundle => object.type === 'customfield',
  );

  function generateForFields(
    fields: UnparsedCustomFieldBundle[],
  ): TE.TaskEither<ReflectionErrors, ParsedFile<CustomFieldMetadata>[]> {
    return pipe(fields, reflectCustomFieldSources);
  }

  return pipe(
    customObjects,
    reflectCustomObjectSources,
    TE.map(filterNonPublished),
    TE.map(filterNonPublic),
    TE.bindTo('objects'),
    TE.bind('fields', () => generateForFields(customFields)),
    // Locate the fields for each object by using the parentName property
    TE.map(({ objects, fields }) => {
      return objects.map((object) => {
        const objectFields = fields.filter((field) => field.type.parentName === object.type.name);
        return {
          ...object,
          type: {
            ...object.type,
            fields: objectFields,
          },
        } as ParsedFile<ObjectMetadata>;
      });
    }),
  );
}