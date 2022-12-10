import { OutputFile } from '../outputFile';
import { OpenApi } from './open-api';

export class OpenapiTypeFile extends OutputFile {
  constructor(public openApiModel: OpenApi) {
    super('openapi', '');
    this.addText(JSON.stringify({ ...openApiModel, namespace: undefined }, null, 2));
  }

  fileExtension(): string {
    return '.json';
  }
}
