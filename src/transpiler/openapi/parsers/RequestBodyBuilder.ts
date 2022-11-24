import { RequestBody } from '../../../model/openapi/open-api-types';
import { Reference } from './ReferenceBuilder';
import { ApexDocHttpRequestBody } from '../../../model/openapi/apex-doc-types';
import { Builder } from './Builder';

/**
 * Parses and builds OpenApi Request Body objects.
 */
export class RequestBodyBuilder extends Builder<RequestBody, ApexDocHttpRequestBody> {
  buildBody(apexRequestBody: ApexDocHttpRequestBody, reference?: Reference): RequestBody {
    return {
      description: apexRequestBody.description,
      content: {
        'application/json': { schema: this.getOpenApiSchemaFromApexDocSchema(apexRequestBody, reference) },
      },
      required: apexRequestBody.required,
    };
  }
}
