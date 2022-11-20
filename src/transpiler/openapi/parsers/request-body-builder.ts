import {
  RequestBody,
  SchemaObject,
  SchemaObjectArray,
  SchemaObjectObject,
} from '../../../model/openapi/open-api-types';
import { Reference, ReferenceBuilder } from './ReferenceBuilder';

/**
 * Parses and builds OpenApi Request Body objects.
 */
export class RequestBodyBuilder {
  build(apexRequestBody: ApexDocHttpRequestBody): RequestBodyResponse {
    let reference: Reference | undefined;
    if (apexRequestBody.schema && this.isReferenceString(apexRequestBody.schema)) {
      reference = new ReferenceBuilder().build(apexRequestBody.schema as string);
    }

    // We will only be supporting one type for now: "application/json".
    return {
      requestBody: {
        description: apexRequestBody.description,
        content: {
          'application/json': { schema: this.getOpenApiSchemaFromApexDocSchema(apexRequestBody.schema, reference) },
        },
        required: apexRequestBody.required,
      },
      reference: reference,
    };
  }

  private getOpenApiSchemaFromApexDocSchema(apexSchema: ApexDocSchemaObject, reference?: Reference): SchemaObject {
    if (reference) {
      // We are dealing with a reference
      return reference!.referenceObject;
    }
    return apexSchema as SchemaObject;
  }

  private isReferenceString = (targetObject: any): boolean => {
    return typeof targetObject === 'string' || targetObject instanceof String;
  };
}

/**
 * Expected type coming from Apex.
 */
export type ApexDocHttpRequestBody = {
  description?: string;
  schema: ApexDocSchemaObject;
  required?: boolean;
};
type ApexDocSchemaObject = ({ schema: SchemaObjectObject } | string) | SchemaObjectArray;

export type RequestBodyResponse = {
  requestBody: RequestBody;
  reference?: Reference;
};
