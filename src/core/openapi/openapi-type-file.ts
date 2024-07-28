import { OutputFile } from '../outputFile';
import { OpenApi } from './open-api';
import { Settings } from '../../settings';

export class OpenapiTypeFile extends OutputFile {
  constructor(public openApiModel: OpenApi) {
    super(Settings.getInstance().openApiFileName(), '');
    this.addText(JSON.stringify({ ...openApiModel, namespace: undefined }, null, 2));
  }

  fileExtension(): string {
    return '.json';
  }
}
