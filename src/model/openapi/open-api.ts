import { array } from 'yargs';
import { Settings } from '../../settings';

export class OpenApi {
  openapi = '3.1.0';
  info: InfoObject;
  paths: PathsObject;
  servers: ServerObject[];

  constructor() {
    this.info = {
      title: Settings.getInstance().getOpenApiTitle(),
      version: '1.0',
    };

    this.servers = [
      {
        url: '/services/apexrest/',
      },
    ];

    this.paths = {};
  }
}

type InfoObject = {
  title: string;
  version: string;
};

type ServerObject = {
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

type OperationObject = {
  description?: string;
  requestBody?: RequestBody[];
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
type RequestBody = {
  description?: string;
  content: RequestBodyContent;
  required?: boolean;
};

type RequestBodyContent = {
  [index: string]: MediaTypeObject;
};

type MediaTypeObject = {
  schema?: SchemaObject;
  example?: any; // TODO: Parse this on the output
  examples?: { [index: string]: ExampleObject }; // TODO: Parse this on the output
};

type ExampleObject = {
  summary?: string;
  description?: string;
  value?: any;
};

// Responses
type ResponsesObject = {
  [index: string]: ResponseObject;
};

type ResponseObject = {
  description: string;
  content?: ContentObject;
};

type ContentObject = {
  [index: string]: SchemaObject;
};

// Common

type SchemaObject = {
  schema: SchemaObjectObject | SchemaObjectArray;
};

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
