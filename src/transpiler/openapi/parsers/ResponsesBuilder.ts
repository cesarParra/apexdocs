import { ResponseObject } from '../../../model/openapi/open-api-types';
import { Reference } from './ReferenceBuilder';
import { ApexDocHttpResponse } from '../../../model/openapi/apex-doc-types';
import { Builder } from './Builder';

export class ResponsesBuilder extends Builder<ResponseObject, ApexDocHttpResponse> {
  buildBody(apexDocResponseDefinition: ApexDocHttpResponse, reference?: Reference): ResponseObject {
    return {
      description: `Status code ${apexDocResponseDefinition.statusCode}`,
      content: {
        'application/json': {
          schema: this.getOpenApiSchemaFromApexDocSchema(apexDocResponseDefinition, reference),
        },
      },
    };
  }
}
