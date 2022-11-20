import { PropertiesObject, ReferenceObject, SchemaObjectObject } from '../../../model/openapi/open-api-types';
import { TypesRepository } from '../../../model/types-repository';
import { ClassMirror } from '@cparra/apex-reflection';

// TODO: Unit tests
export class ReferenceBuilder {
  build(referencedTypeName: string): Reference {
    // TODO: We also need to support inner classes
    const referencedType = TypesRepository.getInstance().getFromAllByName(referencedTypeName);
    if (!referencedType) {
      // TODO: Maybe throw an error?
      // TODO: Also check if the referenced type is not a class (it should always be).
    }

    // Generate properties object from type
    const properties: PropertiesObject = {};

    // Filtering based on Salesforce's documentation: https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_rest_methods.htm#ApexRESTUserDefinedTypes
    // Note that we assume that the class only contains object types allowed by Apex Rest:
    // "Note that the public, private, or global class member variables must be types allowed by Apex REST"
    const propertiesAndFields = [
      ...(referencedType as ClassMirror).properties,
      ...(referencedType as ClassMirror).fields,
    ]
      .filter((current) => current.access_modifier.toLowerCase() !== 'protected')
      .filter((current) => !current.memberModifiers.includes('static')); // TODO: Also filter out transient, but we need to add support in apex-reflection library

    propertiesAndFields.forEach((current) => {
      properties[current.name] = {
        type: this.getReferenceType(current.type),
      };
    });

    return {
      referencedClass: referencedTypeName,
      referenceObject: {
        $ref: `#/components/schemas/${referencedTypeName}`,
      },
      schema: {
        type: 'object',
        properties: properties,
      },
    };
  }

  private getReferenceType(typeInMirror: string): string {
    // TODO: Better support for list and maps, instead of it just returning object
    // Returns a valid type supported by OpenApi from a received Apex type.
    typeInMirror = typeInMirror.toLowerCase();
    switch (typeInMirror) {
      case 'boolean':
        return 'boolean';
      case 'decimal':
        return 'number';
      case 'double':
        return 'number';
      case 'id':
        return 'string';
      case 'integer':
        return 'integer';
      case 'long':
        return 'number';
      case 'string':
        return 'string';
      default:
        return 'object';
    }
  }
}

/**
 * In case where the Request Body contains a reference, this contains information about the handled reference
 */
export type Reference = {
  /** Name of the class being referenced */
  referencedClass: string;
  /** OpenApi style reference object */
  referenceObject: ReferenceObject;
  /** Parsed representation of the referenced object as an OpenApi Schema object */
  schema: SchemaObjectObject;
};
