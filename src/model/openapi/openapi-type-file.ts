import { File } from '../file';
import { OpenApi } from './open-api';

export class OpenapiTypeFile extends File {
  constructor(public openApiModel: OpenApi) {
    super('openapi', '');
    this.addText(JSON.stringify(openApiModel));
  }

  fileExtension(): string {
    return '.json';
  }
}
