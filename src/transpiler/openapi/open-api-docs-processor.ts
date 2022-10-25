import ProcessorTypeTranspiler, { LinkingStrategy } from '../processor-type-transpiler';
import { FileContainer } from '../file-container';
import { ClassMirror, MethodMirror, Type } from '@cparra/apex-reflection';
import { OpenApi } from '../../model/openapi/open-api';
import { OpenapiTypeFile } from '../../model/openapi/openapi-type-file';
import { Logger } from '../../util/logger';

export class OpenApiDocsProcessor extends ProcessorTypeTranspiler {
  protected readonly _fileContainer: FileContainer;
  openApiModel: OpenApi;

  constructor() {
    super();
    this._fileContainer = new FileContainer();
    this.openApiModel = new OpenApi();
  }

  fileBuilder(): FileContainer {
    return this._fileContainer;
  }

  getLinkingStrategy(): LinkingStrategy {
    return 'root-relative';
  }

  onProcess(type: Type): void {
    Logger.logSingle(`Processing ${type.name}`, false, 'green', false);

    const restResourceAnnotation = type.annotations.find((element) => element.name.toLowerCase() === 'restresource');
    const urlMapping = restResourceAnnotation?.elementValues?.find(
      (element) => element.key.toLowerCase() === 'urlmapping',
    );
    if (!urlMapping) {
      Logger.error(`Type does not contain urlMapping annotation ${type.name}`);
      return;
    }
    const urlValue = urlMapping.value.replaceAll('"', '').replaceAll("'", '');
    this.openApiModel.paths[urlValue] = {};
    if (type.docComment?.description) {
      this.openApiModel.paths[urlValue].description = type.docComment.description;
    }

    // We can safely cast to a ClassMirror, since only these support the @RestResource annotation
    const typeAsClass = type as ClassMirror;

    const hasAnnotation = (method: MethodMirror, annotationName: string) =>
      method.annotations.some((annotation) => annotation.name.toLowerCase() === annotationName);

    // GET
    const httpGetMethod = typeAsClass.methods.find((method) => hasAnnotation(method, 'httpget'));
    if (httpGetMethod) {
      this.openApiModel.paths[urlValue].get = {};
      if (httpGetMethod.docComment?.description) {
        this.openApiModel.paths[urlValue].get!.description = httpGetMethod.docComment.description;
      }
    }
    // PATCH
    // POST
    // PUT
    // DELETE

    //
    // 'httpdelete',
    //   '',
    //   'httppatch',
    //   'httppost',
    //   'httpput',

    this._fileContainer.pushFile(new OpenapiTypeFile(this.openApiModel));
  }
}
