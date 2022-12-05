import { PropertiesObject, ReferenceObject, SchemaObject } from '../../../model/openapi/open-api-types';
import { TypesRepository } from '../../../model/types-repository';
import { ClassMirror } from '@cparra/apex-reflection';
import { ListObjectType, ReferencedType } from '@cparra/apex-reflection/index';

// TODO: Unit tests
export class ReferenceBuilder {
  build(referencedTypeName: string): Reference {
    // TODO: We also need to support inner classes
    const referencedType = TypesRepository.getInstance().getFromAllByName(referencedTypeName);
    if (!referencedType) {
      throw new Error(`The referenced class "${referencedTypeName}" was not found.`);
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
      .filter((current) => !current.memberModifiers.includes('static'))
      .filter((current) => !current.memberModifiers.includes('transient'));

    propertiesAndFields.forEach((current) => {
      properties[current.name] = this.getReferenceType(current.typeReference);
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

  private getReferenceType(typeInMirror: ReferencedType): SchemaObject {
    // TODO: Return descriptions based on the apexdoc for the prop

    // Returns a valid type supported by OpenApi from a received Apex type.
    const typeName = typeInMirror.type.toLowerCase();
    switch (typeName) {
      case 'boolean':
        return { type: 'boolean' };
      case 'date':
        return { type: 'string', format: 'date' };
      case 'datetime':
        return { type: 'string', format: 'date-time' };
      case 'decimal':
        return { type: 'number' };
      case 'double':
        return { type: 'number' };
      case 'id':
        return { type: 'string' };
      case 'integer':
        return { type: 'integer' };
      case 'long':
        return { type: 'integer', format: 'int64' };
      case 'string':
        return { type: 'string' };
      case 'time':
        return { type: 'string', format: 'time' };
      case 'list':
        return { type: 'array', items: this.getReferenceType((typeInMirror as ListObjectType).ofType) };
      default:
        console.log('GOT HERE');
        return { type: 'object' };
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
  schema: SchemaObject;
};
