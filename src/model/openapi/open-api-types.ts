export type InfoObject = {
  title: string;
  version: string;
};

export type ServerObject = {
  url: string;
};

export type PathsObject = {
  [index: string]: PathItemObject;
};

export type PathItemObject = {
  description?: string;
  get?: OperationObject;
  put?: OperationObject;
  post?: OperationObject;
  delete?: OperationObject;
  patch?: OperationObject;
};

export type OperationObject = {
  description?: string;
  requestBody?: RequestBody;
  parameters?: ParameterObject[];
  responses?: ResponsesObject;
};

// Parameters
export type ParameterObject = {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema?: SchemaObject;
};

// Request Body
export type RequestBody = {
  description?: string;
  content: RequestBodyContent;
  required?: boolean;
};

export type RequestBodyContent = {
  [index: string]: MediaTypeObject; // Only key supported is "application/json" for now.
};

export type MediaTypeObject = {
  schema?: SchemaObject;
  example?: any; // TODO: Parse this on the output
  examples?: { [index: string]: ExampleObject }; // TODO: Parse this on the output
};

export type ExampleObject = {
  summary?: string;
  description?: string;
  value?: any;
};

// Responses
export type ResponsesObject = {
  [index: string]: ResponseObject;
};

export type ResponseObject = {
  description: string;
  content?: ContentObject;
};

export type ContentObject = {
  [index: string]: SchemaObject; // key is usually 'application/json'
};

// Common
export type SchemaObject = ({ schema: SchemaObjectObject } | ReferenceObject) | SchemaObjectArray;

export type SchemaObjectObject = {
  type: string; // This can be "object" (which would require properties), or a primitive
  properties?: PropertiesObject;
};

export type PropertiesObject = {
  [index: string]: {
    type: string;
    description?: string;
    format?: string;
  };
};

export type SchemaObjectArray = {
  type: 'array';
  items: SchemaObject;
};

// Reference and components

export type ReferenceObject = {
  $ref: string;
};

export type ComponentsObject = {
  schemas: {
    [index: string]: SchemaObjectObject;
  };
};
