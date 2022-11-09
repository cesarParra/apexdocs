import { ComponentsObject, InfoObject, PathsObject, ServerObject } from './open-api-types';

const OPEN_API_VERSION = '3.1.0';
// TODO: Allow for users to (optionally) pass a namespace that would be appended here, since that is supported
// by Salesforce in cases where the endpoint is in a managed package
const SERVER_URL = '/services/apexrest/';

/**
 * Represents the OpenApi 3.1.0 spec
 * https://spec.openapis.org/oas/v3.1.0
 */
// TODO: Unit tests
export class OpenApi {
  openapi = OPEN_API_VERSION;
  info: InfoObject;
  paths: PathsObject;
  servers: ServerObject[];
  components?: ComponentsObject;

  constructor(title: string, version: string) {
    this.info = {
      title: title,
      version: version,
    };

    this.servers = [
      {
        url: SERVER_URL,
      },
    ];

    this.paths = {};
  }
}
