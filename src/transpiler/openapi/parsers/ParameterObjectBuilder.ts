import { ParameterObject } from '../../../core/openapi/open-api-types';
import { Reference } from './ReferenceBuilder';
import { ApexDocParameterObject } from '../../../core/openapi/apex-doc-types';
import { Builder } from './Builder';

export class ParameterObjectBuilder extends Builder<ParameterObject, ApexDocParameterObject> {
  buildBody(apexDocObject: ApexDocParameterObject, reference?: Reference): ParameterObject {
    return {
      ...apexDocObject,
      schema: this.getOpenApiSchemaFromApexDocSchema(apexDocObject, reference),
    };
  }
}
