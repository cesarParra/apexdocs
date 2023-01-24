// verified
export type InfoObject = {
  title: string;
  version: string;
};

// verified
export type ServerObject = {
  url: string;
};

// verified
export type PathsObject = {
  [index: string]: PathItemObject;
};

// verified
export type PathItemObject = {
  description?: string;
  get?: OperationObject;
  put?: OperationObject;
  post?: OperationObject;
  delete?: OperationObject;
  patch?: OperationObject;
};

// verified
export type OperationObject = {
  tags?: string[];
  description?: string;
  summary?: string;
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
  example?: any;
  examples?: { [index: string]: ExampleObject };
};

export type ExampleObject = {
  summary?: string;
  description?: string;
  value?: any;
};

// Responses
export type ResponsesObject = {
  [index: string]: ResponseObject; // The key will be the status code number
};

export type ResponseObject = {
  description: string;
  content?: ContentObject;
};

export type ContentObject = {
  [index: string]: { schema: SchemaObject }; // key is usually 'application/json'
};

// Common
export type SchemaObject = SchemaObjectObject | SchemaObjectArray | ReferenceObject;

export type SchemaObjectObject = {
  type: string; // This can be "object" (which would require properties), or a primitive
  properties?: PropertiesObject;
  format?: string;
  description?: string;
};

export type PropertiesObject = {
  [index: string]: SchemaObject;
};

export type SchemaObjectArray = {
  type: 'array';
  items: SchemaObject;
  description?: string;
};

// Reference and components

export type ReferenceObject = {
  $ref: string;
  description?: string;
};

export type ComponentsObject = {
  schemas: {
    [index: string]: SchemaObject;
  };
};

export type TagObject = {
  name: string;
  description?: string;
};
