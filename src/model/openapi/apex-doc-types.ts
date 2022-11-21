// These are types that represent how the data is expected to be created in the ApexDoc (as YAML), which
// in some cases might be different from the official OpenApi spec for simplicity when writing the ApexDoc.

import { SchemaObjectArray, SchemaObjectObject } from './open-api-types';

export type ApexDocHttpResponse = {
  statusCode: number;
  schema: ApexDocSchemaObject;
};

export type ApexDocHttpRequestBody = {
  description?: string;
  schema: ApexDocSchemaObject;
  required?: boolean;
};

export type ApexDocParameterObject = {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema?: ApexDocSchemaObject;
};

export type ApexDocSchemaObject = SchemaObjectObject | SchemaObjectArray | string;
