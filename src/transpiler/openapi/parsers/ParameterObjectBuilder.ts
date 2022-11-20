import { ParameterObject, SchemaObject } from '../../../model/openapi/open-api-types';
import { Reference, ReferenceBuilder } from './ReferenceBuilder';

export class ParameterObjectBuilder {
  build(parameter: ApexDocParameterObject): ParameterObjectBuilderResponse {
    let reference: Reference | undefined;
    if (parameter.schema && this.isReferenceString(parameter.schema)) {
      reference = new ReferenceBuilder().build(parameter.schema as string);
    }

    return {
      reference: reference,
      parameterObject: {
        ...parameter,
        schema: this.getOpenApiSchemaFromApexDocSchema(parameter, reference),
      },
    };
  }

  private getOpenApiSchemaFromApexDocSchema(parameter: ApexDocParameterObject, reference?: Reference): SchemaObject {
    if (reference) {
      // We are dealing with a reference
      return reference!.referenceObject;
    }
    return parameter.schema as SchemaObject;
  }

  private isReferenceString = (targetObject: any): boolean => {
    return typeof targetObject === 'string' || targetObject instanceof String;
  };
}

export type ApexDocParameterObject = {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema?: SchemaObject | string;
};

export type ParameterObjectBuilderResponse = {
  parameterObject: ParameterObject;
  reference?: Reference;
};
