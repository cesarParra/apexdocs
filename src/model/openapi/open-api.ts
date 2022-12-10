import { ComponentsObject, InfoObject, PathsObject, ServerObject } from './open-api-types';

const OPEN_API_VERSION = '3.1.0';
const SERVER_URL = '/services/apexrest/';

/**
 * Represents the OpenApi 3.1.0 spec
 * https://spec.openapis.org/oas/v3.1.0
 */
export class OpenApi {
  openapi = OPEN_API_VERSION;
  info: InfoObject;
  paths: PathsObject;
  servers: ServerObject[];
  components?: ComponentsObject;

  constructor(title: string, version: string, private namespace?: string) {
    this.info = {
      title: title,
      version: version,
    };

    this.servers = [
      {
        url: this.getServerUrl(),
      },
    ];

    this.paths = {};
  }

  private getServerUrl(): string {
    if (!this.namespace) {
      return SERVER_URL;
    }

    return `${SERVER_URL}${this.namespace}/`;
  }
}
