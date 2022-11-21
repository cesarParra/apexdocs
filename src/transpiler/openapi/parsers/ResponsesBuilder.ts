import { ResponseObject, SchemaObject } from '../../../model/openapi/open-api-types';
import { Reference, ReferenceBuilder } from './ReferenceBuilder';
import { ApexDocHttpResponse, ApexDocSchemaObject } from '../../../model/openapi/apex-doc-types';

export class ResponsesBuilder {
  build(apexDocResponseDefinition: ApexDocHttpResponse): ResponsesBuilderResponse {
    let reference: Reference | undefined;
    if (apexDocResponseDefinition.schema && this.isReferenceString(apexDocResponseDefinition.schema)) {
      reference = new ReferenceBuilder().build(apexDocResponseDefinition.schema as string);
    }

    return {
      reference: reference,
      response: {
        description: `Status code ${apexDocResponseDefinition.statusCode}`,
        content: {
          'application/json': {
            schema: this.getOpenApiSchemaFromApexDocSchema(apexDocResponseDefinition.schema, reference),
          },
        },
      },
    };
  }

  private getOpenApiSchemaFromApexDocSchema(apexSchema: ApexDocSchemaObject, reference?: Reference): SchemaObject {
    if (this.isReferenceString(apexSchema)) {
      return reference!.referenceObject;
    }
    return apexSchema;
  }

  private isReferenceString = (targetObject: any): targetObject is string => {
    return typeof targetObject === 'string' || targetObject instanceof String;
  };
}

export type ResponsesBuilderResponse = {
  response: ResponseObject;
  reference?: Reference;
};
