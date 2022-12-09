import ProcessorTypeTranspiler from '../processor-type-transpiler';
import { FileContainer } from '../file-container';
import { ClassMirror, Type } from '@cparra/apex-reflection';
import { OpenapiTypeFile } from '../../model/openapi/openapi-type-file';
import { Logger } from '../../util/logger';
import { OpenApi } from '../../model/openapi/open-api';
import { Settings } from '../../settings';
import { MethodParser } from './parsers/MethodParser';

export class OpenApiDocsProcessor extends ProcessorTypeTranspiler {
  protected readonly _fileContainer: FileContainer;
  openApiModel: OpenApi;

  constructor() {
    super();
    this._fileContainer = new FileContainer();
    const title = Settings.getInstance().getOpenApiTitle();
    if (!title) {
      throw Error('No OpenApi title was provided.');
    }
    this.openApiModel = new OpenApi(title, '1.0.0');
  }

  fileBuilder(): FileContainer {
    return this._fileContainer;
  }

  onProcess(type: Type): void {
    Logger.logSingle(`Processing ${type.name}`, false, 'green', false);

    const endpointPath = this.getEndpointPath(type);
    if (!endpointPath) {
      return;
    }

    this.openApiModel.paths[endpointPath] = {};
    if (type.docComment?.description) {
      this.openApiModel.paths[endpointPath].description = type.docComment.description;
    }

    // We can safely cast to a ClassMirror, since only these support the @RestResource annotation
    const typeAsClass = type as ClassMirror;

    const parser = new MethodParser(this.openApiModel);

    // GET
    parser.parseMethod(typeAsClass, endpointPath, 'get');

    // PATCH
    parser.parseMethod(typeAsClass, endpointPath, 'patch');

    // POST
    parser.parseMethod(typeAsClass, endpointPath, 'post');

    // PUT
    parser.parseMethod(typeAsClass, endpointPath, 'put');

    // DELETE
    parser.parseMethod(typeAsClass, endpointPath, 'delete');

    this._fileContainer.pushFile(new OpenapiTypeFile(this.openApiModel));
  }

  private getEndpointPath(type: Type): string | null {
    const restResourceAnnotation = type.annotations.find((element) => element.name.toLowerCase() === 'restresource');
    const urlMapping = restResourceAnnotation?.elementValues?.find(
      (element) => element.key.toLowerCase() === 'urlmapping',
    );
    if (!urlMapping) {
      Logger.error(`Type does not contain urlMapping annotation ${type.name}`);
      return null;
    }

    return urlMapping.value.replaceAll('"', '').replaceAll("'", '');
  }
}
