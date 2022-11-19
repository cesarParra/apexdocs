import ProcessorTypeTranspiler, { LinkingStrategy } from '../processor-type-transpiler';
import { FileContainer } from '../file-container';
import { ClassMirror, MethodMirror, Type } from '@cparra/apex-reflection';
import { OpenapiTypeFile } from '../../model/openapi/openapi-type-file';
import { Logger } from '../../util/logger';
import * as yaml from 'js-yaml';
import { TypesRepository } from '../../model/types-repository';
import {
  ParameterObject,
  PropertiesObject,
  RequestBody,
  SchemaObject,
  SchemaObjectArray,
  SchemaObjectObject,
} from '../../model/openapi/open-api-types';
import { OpenApi } from '../../model/openapi/open-api';
import { Settings } from '../../settings';

// TODO: Create types that represent how the ApexDocs actually show all of this stuff
// TODO: Do not depend on OpenApi types directly, but instead ApexDocs types should be convertible to OpenApi ones
type ApexDocHttpResponse = ApexDocHttpResponseWithoutReference | ApexDocHttpResponseWithReference;

type ApexDocHttpResponseWithoutReference = {
  statusCode: number;
} & (SchemaObjectObject | SchemaObjectArray);

type ApexDocHttpResponseWithReference = {
  statusCode: number;
  schema: string;
};

type ApexDocHttpRequestBody = {
  description?: string;
  schema: SchemaObject;
  required?: boolean;
};

type AddToOpenApi = (inYaml: string, urlValue: string) => void;

type HttpOperations = 'get' | 'put' | 'post' | 'delete' | 'patch';

// TODO: A bunch of this logic should be moved out of here
export class OpenApiDocsProcessor extends ProcessorTypeTranspiler {
  protected readonly _fileContainer: FileContainer;
  openApiModel: OpenApi;

  constructor() {
    super();
    this._fileContainer = new FileContainer();
    this.openApiModel = new OpenApi(Settings.getInstance().getOpenApiTitle(), '1.0.0');
  }

  fileBuilder(): FileContainer {
    return this._fileContainer;
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
    this.parseMethod(typeAsClass, urlValue, 'get');

    // PATCH
    this.parseMethod(typeAsClass, urlValue, 'patch');

    // POST
    this.parseMethod(typeAsClass, urlValue, 'post');

    // PUT
    this.parseMethod(typeAsClass, urlValue, 'put');

    // DELETE
    this.parseMethod(typeAsClass, urlValue, 'delete');

    this._fileContainer.pushFile(new OpenapiTypeFile(this.openApiModel));
  }

  private parseMethod(typeAsClass: ClassMirror, urlValue: string, httpMethodKey: HttpOperations) {
    const httpMethod = typeAsClass.methods.find((method) => this.hasAnnotation(method, `http${httpMethodKey}`));
    if (!httpMethod) {
      return;
    }

    this.openApiModel.paths[urlValue][httpMethodKey] = {};
    if (httpMethod.docComment?.description) {
      this.openApiModel.paths[urlValue][httpMethodKey]!.description = httpMethod.docComment.description;
    }

    this.parseHttpAnnotation(httpMethod, urlValue, 'http-request-body', (inYaml, urlValue) =>
      this.addRequestBodyToOpenApi(inYaml, urlValue, httpMethodKey),
    );

    this.parseHttpAnnotation(httpMethod, urlValue, 'http-parameter', (inYaml, urlValue) =>
      this.addParametersToOpenApi(inYaml, urlValue, httpMethodKey),
    );
    this.parseHttpAnnotation(httpMethod, urlValue, 'http-response', (inYaml, urlValue) =>
      this.addHttpResponsesToOpenApi(inYaml, urlValue, httpMethodKey),
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

  private addRequestBodyToOpenApi(inYaml: string, urlValue: string, httpMethodKey: HttpOperations) {
    // Convert the YAML into a JSON object.
    const inJson = yaml.load(inYaml) as ApexDocHttpRequestBody;

    if (inJson.schema && this.isReferenceString(inJson.schema)) {
      this.handleSchemaReference(inJson);
    }

    // We will only be supporting one type for now: "application/json".
    const requestBody: RequestBody = {
      description: inJson.description,
      content: { 'application/json': { schema: inJson.schema } },
      required: inJson.required,
    };

    this.openApiModel.paths[urlValue][httpMethodKey]!.requestBody = requestBody;
  }

  private addParametersToOpenApi(inYaml: string, urlValue: string, httpMethodKey: HttpOperations) {
    // Convert the YAML into a JSON object.
    const inJson = yaml.load(inYaml) as ParameterObject;

    if (inJson.schema && this.isReferenceString(inJson.schema)) {
      this.handleSchemaReference(inJson);
    }

    if (this.openApiModel.paths[urlValue][httpMethodKey]!.parameters === undefined) {
      // If we reach this point that means we have enough data to keep adding to the OpenApi object.
      this.openApiModel.paths[urlValue][httpMethodKey]!.parameters = [];
    }

    this.openApiModel.paths[urlValue][httpMethodKey]!.parameters!.push({
      ...inJson,
    });
  }

  private addHttpResponsesToOpenApi(inYaml: string, urlValue: string, httpMethodKey: HttpOperations) {
    // Convert the YAML into a JSON object.
    const inJson = yaml.load(inYaml) as ApexDocHttpResponse;
    // If we reach this point that means we have enough data to keep adding to the OpenApi object.
    if (this.openApiModel.paths[urlValue][httpMethodKey]!.responses === undefined) {
      this.openApiModel.paths[urlValue][httpMethodKey]!.responses = {};
    }

    // Copy all properties, but delete the status code as it does not belong to
    // what goes in the schema
    const schema: any = { ...inJson };
    delete schema.statusCode;

    const hasReference = !!schema.schema;
    if (hasReference) {
      // If it contains a schema property, we are dealing with a reference
      this.handleSchemaReference(schema);
    }

    let schemaToOutput;
    if (hasReference) {
      schemaToOutput = schema.schema;
    } else {
      schemaToOutput = schema;
    }

    this.openApiModel.paths[urlValue][httpMethodKey]!.responses![inJson.statusCode] = {
      description: `Status code ${inJson.statusCode}`,
      content: {
        'application/json': { schema: schemaToOutput },
      },
    };
  }

  private handleSchemaReference(inJson: ParameterObject | ApexDocHttpRequestBody | ApexDocHttpResponseWithReference) {
    // We are dealing with a reference to a different class.
    const referencedClassName = inJson.schema as string;
    inJson.schema = {
      $ref: `#/components/schemas/${referencedClassName}`,
    };

    // Add to "component" section if it hasn't been already
    if (this.openApiModel.components === undefined) {
      this.openApiModel.components = {
        schemas: {},
      };
    }

    // TODO: We also need to support inner classes
    const referencedType = TypesRepository.getInstance().getFromAllByName(referencedClassName);
    if (!referencedType) {
      // TODO: Maybe throw an error?
      // TODO: Also check if the referenced type is not a class (it should always be).
    }

    // Generate properties object from type
    const properties: PropertiesObject = {};

    // Filtering based on Salesforce's documentation: https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_rest_methods.htm#ApexRESTUserDefinedTypes
    // Note that we assume that the class only contains object types allowed by Apex Rest:
    // "Note that the public, private, or global class member variables must be types allowed by Apex REST"
    const propertiesAndFields = [
      ...(referencedType as ClassMirror).properties,
      ...(referencedType as ClassMirror).fields,
    ]
      .filter((current) => current.access_modifier.toLowerCase() !== 'protected')
      .filter((current) => !current.memberModifiers.includes('static')); // TODO: Also filter out transient, but we need to add support in apex-reflection library

    propertiesAndFields.forEach((current) => {
      properties[current.name] = {
        type: this.getReferenceType(current.type),
      };
    });

    // TODO: Check if it really doesn't exist yet
    this.openApiModel.components.schemas![referencedClassName] = {
      type: 'object',
      properties: properties,
    };
  }

  private getReferenceType(typeInMirror: string): string {
    // TODO: Better support for list and maps, instead of it just returning object
    // Returns a valid type supported by OpenApi from a received Apex type.
    typeInMirror = typeInMirror.toLowerCase();
    switch (typeInMirror) {
      case 'boolean':
        return 'boolean';
      case 'decimal':
        return 'number';
      case 'double':
        return 'number';
      case 'id':
        return 'string';
      case 'integer':
        return 'integer';
      case 'long':
        return 'number';
      case 'string':
        return 'string';
      default:
        return 'object';
    }
  }

  private hasAnnotation = (method: MethodMirror, annotationName: string) =>
    method.annotations.some((annotation) => annotation.name.toLowerCase() === annotationName);

  private isReferenceString = (targetObject: any): boolean => {
    return typeof targetObject === 'string' || targetObject instanceof String;
  };
}
