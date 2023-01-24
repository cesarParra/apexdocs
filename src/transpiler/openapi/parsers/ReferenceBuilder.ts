import * as yaml from 'js-yaml';
import {
  PropertiesObject,
  ReferenceObject,
  SchemaObject,
  SchemaObjectArray,
  SchemaObjectObject,
} from '../../../model/openapi/open-api-types';
import { TypeBundle, TypesRepository } from '../../../model/types-repository';
import { ClassMirror, DocCommentAnnotation, FieldMirror, PropertyMirror } from '@cparra/apex-reflection';
import { ListObjectType, ReferencedType } from '@cparra/apex-reflection';
import { ApexDocSchemaObject } from '../../../model/openapi/apex-doc-types';

type TypeBundleWithIsCollectionAndReferenceOverrides = TypeBundle & {
  originalTypeName: string;
  isCollection: boolean;
  referenceOverrides: ReferenceOverride[];
};

export class ReferenceBuilder {
  build(referencedTypeName: string): Reference {
    const originalTypeName = referencedTypeName;
    const regexForSchemaOverrides = /\[(.*?)]/g;
    const schemaOverrides = referencedTypeName.match(regexForSchemaOverrides);
    let referenceOverrides: ReferenceOverride[] = [];
    if (schemaOverrides && schemaOverrides.length > 0) {
      referenceOverrides = ReferenceOverrides.build(schemaOverrides[0]);
      referencedTypeName = referencedTypeName.replace(regexForSchemaOverrides, '');
    }

    const [parsedReferencedType, isCollection] = this.handlePossibleCollectionReference(referencedTypeName);
    const referencedTypeBundle = TypesRepository.getInstance().getFromAllByName(parsedReferencedType);

    if (!referencedTypeBundle) {
      throw new Error(`The referenced type ${referencedTypeName} was not found.`);
    }
    if (referencedTypeBundle.type.type_name !== 'class') {
      throw new Error(
        `Expected the referenced type to be a class, but found a ${referencedTypeBundle.type.type_name}.`,
      );
    }
    const typeBundleWithIsCollection = {
      ...referencedTypeBundle,
      originalTypeName: originalTypeName,
      isCollection: isCollection,
      referenceOverrides: referenceOverrides,
    };
    return this.buildReferenceFromType(typeBundleWithIsCollection);
  }

  /**
   * Returns a tuple where the first value is the name of the reference without any collection related values
   * and the second is a boolean representing if we are dealing with a collection or not.
   * @param referencedTypeName The received raw type name.
   * @private
   */
  private handlePossibleCollectionReference(referencedTypeName: string): [string, boolean] {
    referencedTypeName = referencedTypeName.toLowerCase();
    if (referencedTypeName.startsWith('list<') && referencedTypeName.endsWith('>')) {
      referencedTypeName = referencedTypeName.replace('list<', '');
      referencedTypeName = referencedTypeName.replace('>', '');
      return [referencedTypeName, true];
    }
    if (referencedTypeName.startsWith('set<') && referencedTypeName.endsWith('>')) {
      referencedTypeName = referencedTypeName.replace('set<', '');
      referencedTypeName = referencedTypeName.replace('>', '');
      return [referencedTypeName, true];
    }
    return [referencedTypeName, false];
  }

  private buildReferenceFromType(typeBundle: TypeBundleWithIsCollectionAndReferenceOverrides): Reference {
    // Filtering based on Salesforce's documentation:
    // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_rest_methods.htm#ApexRESTUserDefinedTypes
    // We assume that the class only contains object types allowed by Apex Rest:
    // "Note that the public, private, or global class member variables must be types allowed by Apex REST"
    const propertiesAndFields: (FieldMirror | PropertyMirror)[] = [
      ...(typeBundle.type as ClassMirror).properties,
      ...(typeBundle.type as ClassMirror).fields,
    ]
      .filter((current) => !current.memberModifiers.includes('static'))
      .filter((current) => !current.memberModifiers.includes('transient'));

    const properties: PropertiesObject = {};
    let referencedComponents: ReferenceComponent[] = [];
    propertiesAndFields.forEach((current) => {
      // Check if there are reference overrides for the current property, this takes priority over anything else.
      const referenceOverride = typeBundle.referenceOverrides.find((currentOverride) => {
        return currentOverride.propertyName.toLowerCase() === current.name.toLowerCase();
      });
      if (referenceOverride) {
        const reference = this.build(referenceOverride.referenceName);
        properties[current.name] = reference.entrypointReferenceObject;
        reference.referenceComponents.forEach((current) => referencedComponents.push(current));
      } else {
        // Check for "@http-schema" annotations within properties themselves. If these are specified they
        // take precedence over the property type itself.
        const manuallyDefinedHttpSchema = current.docComment?.annotations.find(
          (annotation) => annotation.name.toLowerCase() === 'http-schema',
        );
        if (manuallyDefinedHttpSchema) {
          this.handleOverriddenSchema(manuallyDefinedHttpSchema, properties, current, referencedComponents);
        } else {
          const pair = this.getReferenceType(current.typeReference);
          properties[current.name] = pair.schema;
          pair.referenceComponents.forEach((current) => referencedComponents.push(current));
        }
      }

      properties[current.name].description = current.docComment?.description;
    });
    const mainReferenceComponents = this.buildMainReferenceComponent(typeBundle, properties);

    // Make sure to add the "main" reference first
    referencedComponents = [...mainReferenceComponents, ...referencedComponents];

    return {
      entrypointReferenceObject: {
        $ref: `#/components/schemas/${this.getReferenceName(typeBundle)}`,
      },
      referenceComponents: referencedComponents,
    };
  }

  private handleOverriddenSchema(
    manuallyDefinedHttpSchema: DocCommentAnnotation,
    properties: PropertiesObject,
    current: FieldMirror | PropertyMirror,
    referencedComponents: ReferenceComponent[],
  ) {
    // This can be of type ApexDocSchemaObject
    const inYaml = manuallyDefinedHttpSchema?.bodyLines.reduce((prev, current, _) => prev + '\n' + current);
    const asJson = yaml.load(inYaml) as ApexDocSchemaObject;
    const isReferenceString = this.isReferenceString(asJson);

    if (isReferenceString) {
      const reference = this.build(asJson);
      properties[current.name] = reference.entrypointReferenceObject;
      reference.referenceComponents.forEach((current) => referencedComponents.push(current));
    } else {
      // If we are dealing with a manually defined schema object, we can add it directly to the "properties" map,
      // because we don't need to add a reference component.
      properties[current.name] = asJson;
    }
  }

  private getReferenceName(typeBundle: TypeBundleWithIsCollectionAndReferenceOverrides): string {
    let referenceName = typeBundle.type.name;
    if (typeBundle.isChild) {
      referenceName = `${typeBundle.parentType?.name}.${typeBundle.type.name}`;
    }
    if (typeBundle.isCollection) {
      referenceName = `${referenceName}_array`;
    }
    if (typeBundle.referenceOverrides.length) {
      referenceName = `${referenceName}_${typeBundle.originalTypeName}`;
    }
    return referenceName;
  }

  private buildMainReferenceComponent(
    typeBundle: TypeBundleWithIsCollectionAndReferenceOverrides,
    properties: PropertiesObject,
  ): ReferenceComponent[] {
    // For the main reference, we always want to get the reference of the object without the collection part,
    // so we pass the typeBundle to `getReferenceName` but with the isCollection flag set to false.
    const mainReferenceName = this.getReferenceName({ ...typeBundle, isCollection: false });
    const mainReference: ReferenceComponent = {
      referencedClass: mainReferenceName,
      schema: {
        type: 'object',
        properties: properties,
      },
    };
    const referencedComponents = [mainReference];
    if (!typeBundle.isCollection) {
      return referencedComponents;
    }

    return [
      {
        referencedClass: this.getReferenceName(typeBundle),
        schema: {
          type: 'array',
          items: {
            $ref: `#/components/schemas/${mainReferenceName}`,
          },
        },
      },
      ...referencedComponents,
    ];
  }

  public getReferenceType(typeInMirror: ReferencedType): SchemaObjectReferencePair {
    // Returns a valid type supported by OpenApi from a received Apex type.
    const typeName = typeInMirror.type.toLowerCase();
    switch (typeName) {
      case 'boolean':
        return { schema: { type: 'boolean' }, referenceComponents: [] };
      case 'date':
        return { schema: { type: 'string', format: 'date' }, referenceComponents: [] };
      case 'datetime':
        return { schema: { type: 'string', format: 'date-time' }, referenceComponents: [] };
      case 'decimal':
        return { schema: { type: 'number' }, referenceComponents: [] };
      case 'double':
        return { schema: { type: 'number' }, referenceComponents: [] };
      case 'id':
        return { schema: { type: 'string' }, referenceComponents: [] };
      case 'integer':
        return { schema: { type: 'integer' }, referenceComponents: [] };
      case 'long':
        return { schema: { type: 'integer', format: 'int64' }, referenceComponents: [] };
      case 'string':
        return { schema: { type: 'string' }, referenceComponents: [] };
      case 'time':
        return { schema: { type: 'string', format: 'time' }, referenceComponents: [] };
      case 'list':
        return this.buildCollectionPair(typeInMirror);
      case 'set':
        return this.buildCollectionPair(typeInMirror);
      case 'map':
        // For Maps, we treat them as objects but do not try to define their shape, because their keys can vary
        // at runtime.
        return { schema: { type: 'object' }, referenceComponents: [] };
      default:
        // If we got here we are dealing with a non-primitive (most likely a custom class or an SObject).
        const referencedType = TypesRepository.getInstance().getFromAllByName(typeName);
        if (!referencedType) {
          return { schema: { type: 'object' }, referenceComponents: [] };
        }
        const reference = this.buildReferenceFromType({
          ...referencedType,
          isCollection: false,
          referenceOverrides: [],
          originalTypeName: typeName,
        });
        return {
          schema: reference.entrypointReferenceObject,
          referenceComponents: [...reference.referenceComponents],
        };
    }
  }

  private buildCollectionPair(typeInMirror: ReferencedType) {
    const innerReference = this.getReferenceType((typeInMirror as ListObjectType).ofType);
    return {
      schema: { type: 'array', items: innerReference.schema },
      referenceComponents: [...innerReference.referenceComponents],
    };
  }

  private isReferenceString = (targetObject: unknown): targetObject is string => {
    return typeof targetObject === 'string' || targetObject instanceof String;
  };
}

type SchemaObjectReferencePair = {
  schema: SchemaObject;
  referenceComponents: ReferenceComponent[];
};

class ReferenceOverrides {
  static build(referenceAsString: string): ReferenceOverride[] {
    const cleanedUpReference = referenceAsString.replace(/[\[\]]/g, '');
    const referenceStrings = cleanedUpReference.split(',').map((item) => item.replace(/\s/g, ''));
    return referenceStrings.map((item) => {
      const [propertyName, referenceName] = item.split(':');
      return { propertyName, referenceName };
    });
  }
}

type ReferenceOverride = {
  propertyName: string;
  referenceName: string;
};

/**
 * In case where the Request Body contains a reference, this contains information about the handled reference
 */
export type Reference = {
  /** OpenApi style reference object for the parent caller */
  entrypointReferenceObject: ReferenceObject;
  /** List of objects that contain all component references identified by a call to this builder **/
  referenceComponents: ReferenceComponent[];
};

export type ReferenceComponent = {
  /** Name of the class being referenced */
  referencedClass: string;
  /** Parsed representation of the referenced object as an OpenApi Schema object */
  schema: SchemaObjectObject | SchemaObjectArray;
};
