import {
  ParsedFile,
  UnparsedCustomFieldBundle,
  UnparsedCustomMetadataBundle,
  UnparsedCustomObjectBundle,
} from '../../shared/types';
import { CustomObjectMetadata, reflectCustomObjectSources } from './reflect-custom-object-sources';
import * as TE from 'fp-ts/TaskEither';
import { ReflectionErrors } from '../../errors/errors';
import { CustomFieldMetadata, reflectCustomFieldSources } from './reflect-custom-field-source';
import { pipe } from 'fp-ts/function';
import { TaskEither } from 'fp-ts/TaskEither';
import { CustomMetadataMetadata, reflectCustomMetadataSources } from './reflect-custom-metadata-source';
import { noopReflectionDebugLogger, type ReflectionDebugLogger } from '../apex/reflect-apex-source';

export function reflectCustomFieldsAndObjectsAndMetadataRecords(
  objectBundles: (UnparsedCustomObjectBundle | UnparsedCustomFieldBundle | UnparsedCustomMetadataBundle)[],
  visibilitiesToDocument: string[],
  debugLogger: ReflectionDebugLogger = noopReflectionDebugLogger,
): TaskEither<ReflectionErrors, ParsedFile<CustomObjectMetadata>[]> {
  function filterNonPublished(parsedFiles: ParsedFile<CustomObjectMetadata>[]): ParsedFile<CustomObjectMetadata>[] {
    return parsedFiles.filter((parsedFile) => parsedFile.type.deploymentStatus === 'Deployed');
  }

  /**
   * Returns a tuple of parsed objects to document and the names of the objects that should be actively ignored.
   * @param parsedFiles
   */
  function filter(parsedFiles: ParsedFile<CustomObjectMetadata>[]): [ParsedFile<CustomObjectMetadata>[], string[]] {
    function shouldBeDocumented(parsedFile: ParsedFile<CustomObjectMetadata>): boolean {
      return visibilitiesToDocument.includes(parsedFile.type.visibility.toLowerCase());
    }

    const objectsToDocument = parsedFiles.filter(shouldBeDocumented);
    const objectsToIgnore = parsedFiles
      .filter((parsedFile) => !shouldBeDocumented(parsedFile))
      .map((parsedFile) => parsedFile.type.name);
    return [objectsToDocument, objectsToIgnore];
  }

  const customObjects = objectBundles.filter(
    (object): object is UnparsedCustomObjectBundle => object.type === 'customobject',
  );

  const customFields = objectBundles.filter(
    (object): object is UnparsedCustomFieldBundle => object.type === 'customfield',
  );

  const customMetadata = objectBundles.filter(
    (object): object is UnparsedCustomMetadataBundle => object.type === 'custommetadata',
  );

  function generateForFields(
    fields: UnparsedCustomFieldBundle[],
  ): TE.TaskEither<ReflectionErrors, ParsedFile<CustomFieldMetadata>[]> {
    return pipe(fields, (bundles) => reflectCustomFieldSources(bundles, debugLogger));
  }

  function generateForMetadata(
    metadata: UnparsedCustomMetadataBundle[],
  ): TE.TaskEither<ReflectionErrors, ParsedFile<CustomMetadataMetadata>[]> {
    return pipe(metadata, (bundles) => reflectCustomMetadataSources(bundles, debugLogger));
  }

  return pipe(
    customObjects,
    (bundles) => reflectCustomObjectSources(bundles, debugLogger),
    TE.map(filterNonPublished),
    TE.map(filter),
    TE.bindTo('filterResult'),
    TE.bind('fields', () => generateForFields(customFields)),
    TE.bind('metadata', () => generateForMetadata(customMetadata)),
    TE.map(({ filterResult, fields, metadata }) => {
      return [...mapFieldsAndMetadata(filterResult[0], fields, metadata), ...mapExtensionFields(filterResult, fields)];
    }),
  );
}

function mapFieldsAndMetadata(
  objects: ParsedFile<CustomObjectMetadata>[],
  fields: ParsedFile<CustomFieldMetadata>[],
  metadata: ParsedFile<CustomMetadataMetadata>[],
): ParsedFile<CustomObjectMetadata>[] {
  // Locate the fields for each object by using the parentName property
  return objects.map((object) => {
    const objectFields = fields.filter((field) => field.type.parentName === object.type.name);
    const objectMetadata = metadata.filter((meta) => `${meta.type.parentName}__mdt` === object.type.name);

    return {
      ...object,
      type: {
        ...object.type,
        fields: [...object.type.fields, ...objectFields.map((field) => field.type)],
        metadataRecords: [...object.type.metadataRecords, ...objectMetadata.map((meta) => meta.type)],
      },
    };
  });
}

// "Extension" fields are fields that are in the source code without the corresponding object-meta.xml file.
// These are fields that either extend a standard Salesforce object, or an object in a different package.
function mapExtensionFields(
  filterResult: [ParsedFile<CustomObjectMetadata>[], string[]],
  fields: ParsedFile<CustomFieldMetadata>[],
): ParsedFile<CustomObjectMetadata>[] {
  const objects = filterResult[0];
  const ignoredObjectNames = filterResult[1];

  const extensionFields = fields.filter(
    (field) =>
      !objects.some((object) => object.type.name.toLowerCase() === field.type.parentName.toLowerCase()) &&
      !ignoredObjectNames.map((name) => name.toLowerCase()).includes(field.type.parentName.toLowerCase()),
  );
  // There might be many objects for the same parent name, so we need to group the fields by parent name
  const extensionFieldsByParent = extensionFields.reduce(
    (acc, field) => {
      if (!acc[field.type.parentName]) {
        acc[field.type.parentName] = [];
      }
      acc[field.type.parentName].push(field.type);
      return acc;
    },
    {} as Record<string, CustomFieldMetadata[]>,
  );

  return Object.keys(extensionFieldsByParent).map((key) => {
    const fields = extensionFieldsByParent[key];
    return {
      source: {
        name: key,
        type: 'customobject',
      },
      type: {
        type_name: 'customobject',
        deploymentStatus: 'Deployed',
        visibility: 'Public',
        label: key,
        name: key,
        description: null,
        fields: fields,
        metadataRecords: [],
      },
    };
  });
}
