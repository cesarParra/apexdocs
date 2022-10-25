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
  // TODO: Parameters
  responses?: ResponsesObject;
};

type ResponsesObject = {
  [index: string]: ResponseObject;
};

type ResponseObject = {
  description: string;
  content?: ContentObject;
};

type ContentObject = {
  [index: string]: HeaderObject;
};

// From here, these are expected to be received as is from the ApexDocs
type HeaderObject = {
  description: string;
  schema: SchemaObject;
};

type SchemaObject = {
  type: string;
};
