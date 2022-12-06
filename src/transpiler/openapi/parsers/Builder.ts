import { Reference, ReferenceBuilder } from './ReferenceBuilder';
import { ApexDocSchemaObject } from '../../../model/openapi/apex-doc-types';
import { SchemaObject } from '../../../model/openapi/open-api-types';

export type ApexDocSchemaAware = {
  schema: ApexDocSchemaObject;
};

export abstract class Builder<T, K> {
  build(schemaAware: ApexDocSchemaAware): Response<T> {
    let reference: Reference | undefined;
    if (this.isReferenceString(schemaAware.schema)) {
      reference = new ReferenceBuilder().build(schemaAware.schema);
    }

    return {
      reference: reference,
      body: this.buildBody(schemaAware as K, reference),
    };
  }

  abstract buildBody(apexDocObject: K, reference?: Reference): T;

  protected getOpenApiSchemaFromApexDocSchema(schemaAware: ApexDocSchemaAware, reference?: Reference): SchemaObject {
    if (this.isReferenceString(schemaAware.schema)) {
      // We are dealing with a reference
      return reference!.entrypointReferenceObject;
    }
    return schemaAware.schema;
  }

  private isReferenceString = (targetObject: any): targetObject is string => {
    return typeof targetObject === 'string' || targetObject instanceof String;
  };
}

export interface Response<T> {
  reference?: Reference;
  body: T;
}
