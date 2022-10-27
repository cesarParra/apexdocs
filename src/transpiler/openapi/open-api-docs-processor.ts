import ProcessorTypeTranspiler, { LinkingStrategy } from '../processor-type-transpiler';
import { FileContainer } from '../file-container';
import { ClassMirror, MethodMirror, Type } from '@cparra/apex-reflection';
import { OpenApi, ParameterObject, SchemaObjectArray, SchemaObjectObject } from '../../model/openapi/open-api';
import { OpenapiTypeFile } from '../../model/openapi/openapi-type-file';
import { Logger } from '../../util/logger';
import * as yaml from 'js-yaml';

type ApexDocHttpResponse = {
  statusCode: number;
} & (SchemaObjectObject | SchemaObjectArray);

type AddToOpenApi = (inYaml: string, urlValue: string) => void;

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

    const urlValue: string = urlMapping.value.replaceAll('"', '').replaceAll("'", '');
    this.openApiModel.paths[urlValue] = {};
    if (type.docComment?.description) {
      this.openApiModel.paths[urlValue].description = type.docComment.description;
    }

    // We can safely cast to a ClassMirror, since only these support the @RestResource annotation
    const typeAsClass = type as ClassMirror;

    // GET
    this.parseGetMethod(typeAsClass, urlValue);

    // PATCH - httppatch
    // POST - httppost
    // PUT - httpput
    // DELETE - httpdelete

    this._fileContainer.pushFile(new OpenapiTypeFile(this.openApiModel));
  }

  private parseGetMethod(typeAsClass: ClassMirror, urlValue: string) {
    const httpGetMethod = typeAsClass.methods.find((method) => this.hasAnnotation(method, 'httpget'));
    if (!httpGetMethod) {
      return;
    }

    this.openApiModel.paths[urlValue].get = {};
    if (httpGetMethod.docComment?.description) {
      this.openApiModel.paths[urlValue].get!.description = httpGetMethod.docComment.description;
    }

    this.parseHttpAnnotation(httpGetMethod, urlValue, 'http-parameter', (inYaml, urlValue) =>
      this.addParametersToOpenApi(inYaml, urlValue),
    );
    this.parseHttpAnnotation(httpGetMethod, urlValue, 'http-response', (inYaml, urlValue) =>
      this.addHttpResponsesToOpenApi(inYaml, urlValue),
    );
  }

  private parseHttpAnnotation(
    httpGetMethod: MethodMirror,
    urlValue: string,
    annotationName: string,
    addToOpenApi: AddToOpenApi,
  ) {
    const annotations = httpGetMethod.docComment?.annotations.filter(
      (annotation) => annotation.name === annotationName,
    );

    if (!annotations?.length) {
      return;
    }

    for (const annotation of annotations) {
      // We expect the ApexDoc data representing this to be in YAML format.
      const inYaml = annotation?.bodyLines.reduce((prev, current, _) => prev + '\n' + current);

      if (!inYaml) {
        return;
      }

      addToOpenApi(inYaml, urlValue);
    }
  }

  private addParametersToOpenApi(inYaml: string, urlValue: string) {
    // Convert the YAML into a JSON object.
    const inJson = yaml.load(inYaml) as ParameterObject;
    // If we reach this point that means we have enough data to keep adding to the OpenApi object.
    if (this.openApiModel.paths[urlValue].get!.parameters === undefined) {
      this.openApiModel.paths[urlValue].get!.parameters = [];
    }

    this.openApiModel.paths[urlValue].get!.parameters!.push({
      ...inJson,
    });
  }

  private addHttpResponsesToOpenApi(inYaml: string, urlValue: string) {
    // Convert the YAML into a JSON object.
    const inJson = yaml.load(inYaml) as ApexDocHttpResponse;
    // If we reach this point that means we have enough data to keep adding to the OpenApi object.
    if (this.openApiModel.paths[urlValue].get!.responses === undefined) {
      this.openApiModel.paths[urlValue].get!.responses = {};
    }

    // Copy all properties, but delete the status code as it does not belong to
    // what goes in the schema
    const schema: any = { ...inJson };
    delete schema.statusCode;
    this.openApiModel.paths[urlValue].get!.responses![inJson.statusCode] = {
      description: `Status code ${inJson.statusCode}`,
      content: {
        'application/xml': {
          schema: schema,
        },
      },
    };
  }

  private hasAnnotation = (method: MethodMirror, annotationName: string) =>
    method.annotations.some((annotation) => annotation.name.toLowerCase() === annotationName);
}
