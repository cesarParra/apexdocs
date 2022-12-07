import {
  PropertiesObject,
  ReferenceObject,
  SchemaObject,
  SchemaObjectArray,
  SchemaObjectObject,
} from '../../../model/openapi/open-api-types';
import { TypesRepository } from '../../../model/types-repository';
import { ClassMirror, FieldMirror, PropertyMirror, Type } from '@cparra/apex-reflection';
import { ListObjectType, ReferencedType } from '@cparra/apex-reflection/index';

export class ReferenceBuilder {
  build(referencedTypeName: string): Reference {
    const [parsedReferencedType, isCollection] = this.handlePossibleCollectionReference(referencedTypeName);

    const referencedType = TypesRepository.getInstance().getFromAllByName(parsedReferencedType);
    if (!referencedType) {
      throw new Error(`The referenced type "${parsedReferencedType}" was not found.`);
    }
    if (referencedType.type_name !== 'class') {
      throw new Error(`Expected the referenced type to be a class, but found a ${referencedType.type_name}.`);
    }
    return this.buildReferenceFromType(referencedType, isCollection);
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

  private buildReferenceFromType(referencedType: Type, isCollection = false): Reference {
    // Filtering based on Salesforce's documentation:
    // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_rest_methods.htm#ApexRESTUserDefinedTypes
    // We assume that the class only contains object types allowed by Apex Rest:
    // "Note that the public, private, or global class member variables must be types allowed by Apex REST"
    const propertiesAndFields: (FieldMirror | PropertyMirror)[] = [
      ...(referencedType as ClassMirror).properties,
      ...(referencedType as ClassMirror).fields,
    ]
      .filter((current) => !current.memberModifiers.includes('static'))
      .filter((current) => !current.memberModifiers.includes('transient'));

    const properties: PropertiesObject = {};
    let referencedComponents: ReferenceComponent[] = [];
    propertiesAndFields.forEach((current) => {
      const pair = this.getReferenceType(current.typeReference);
      properties[current.name] = pair.schema;
      properties[current.name].description = current.docComment?.description;
      pair.referenceComponents.forEach((current) => referencedComponents.push(current));
    });

    const mainReferenceComponents = this.buildMainReferenceComponent(referencedType.name, properties, isCollection);

    // Make sure to add the "main" reference first
    referencedComponents = [...mainReferenceComponents, ...referencedComponents];

    const referenceName = isCollection ? this.getArrayReferenceName(referencedType.name) : referencedType.name;
    return {
      entrypointReferenceObject: {
        $ref: `#/components/schemas/${referenceName}`,
      },
      referenceComponents: referencedComponents,
    };
  }

  private getArrayReferenceName(referencedTypeName: string): string {
    return `${referencedTypeName}_array`;
  }

  private buildMainReferenceComponent(
    referencedTypeName: string,
    properties: PropertiesObject,
    isCollection: boolean,
  ): ReferenceComponent[] {
    const mainReference: ReferenceComponent = {
      referencedClass: referencedTypeName,
      schema: {
        type: 'object',
        properties: properties,
      },
    };
    const referencedComponents = [mainReference];
    if (!isCollection) {
      return referencedComponents;
    }

    return [
      {
        referencedClass: this.getArrayReferenceName(referencedTypeName),
        schema: {
          type: 'array',
          items: {
            $ref: `#/components/schemas/${referencedTypeName}`,
          },
        },
      },
      ...referencedComponents,
    ];
  }

  private getReferenceType(typeInMirror: ReferencedType): SchemaObjectReferencePair {
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
        const reference = this.buildReferenceFromType(referencedType);
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
}

type SchemaObjectReferencePair = {
  schema: SchemaObject;
  referenceComponents: ReferenceComponent[];
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
