import { array } from 'yargs';

export class OpenApi {
  openapi = '3.1.0';
  info: InfoObject;
  paths: PathsObject;
  servers: ServerObject[];

  constructor() {
    this.info = {
      title: 'Some Title',
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
};

type OperationObject = {
  description?: string;
  // TODO: Request body
  parameters?: ParameterObject[];
  responses?: ResponsesObject;
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

// Parameters
export type ParameterObject = {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema?: SchemaObject;
};

// Common

type SchemaObject = {
  schema: SchemaObjectObject | SchemaObjectArray;
};

export type SchemaObjectObject = {
  type: 'object';
  properties: PropertiesObject;
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
