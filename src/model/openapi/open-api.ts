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
};
