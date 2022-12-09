import { ParameterObject } from '../../../model/openapi/open-api-types';
import { Reference } from './ReferenceBuilder';
import { ApexDocParameterObject } from '../../../model/openapi/apex-doc-types';
import { Builder } from './Builder';

export class ParameterObjectBuilder extends Builder<ParameterObject, ApexDocParameterObject> {
  buildBody(apexDocObject: ApexDocParameterObject, reference?: Reference): ParameterObject {
    return {
      ...apexDocObject,
      schema: this.getOpenApiSchemaFromApexDocSchema(apexDocObject, reference),
    };
  }
}
