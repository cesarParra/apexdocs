import { ClassMirror, MethodMirror } from '@cparra/apex-reflection';
import { OpenApi } from '../../../core/openapi/open-api';
import * as yaml from 'js-yaml';
import { ClassMirrorWrapper } from '../../../core/openapi/apex-type-wrappers/ClassMirrorWrapper';
import { Reference, ReferenceBuilder } from './ReferenceBuilder';
import { ParameterObjectBuilder } from './ParameterObjectBuilder';
import { ResponsesBuilder } from './ResponsesBuilder';
import {
  ApexDocHttpRequestBody,
  ApexDocHttpResponse,
  ApexDocParameterObject,
} from '../../../core/openapi/apex-doc-types';
import { RequestBodyBuilder } from './RequestBodyBuilder';
import { ApexDocSchemaAware } from './Builder';
import { PropertiesObject, ReferenceObject } from '../../../core/openapi/open-api-types';
import { MethodMirrorWrapper } from '../../../core/openapi/apex-type-wrappers/MethodMirrorWrapper';

type FallbackMethodParser = (methodMirror: MethodMirror) => void;
type AddToOpenApi<T extends ApexDocSchemaAware> = (input: T, urlValue: string, httpMethodKey: HttpOperations) => void;

type HttpOperations = 'get' | 'put' | 'post' | 'delete' | 'patch';

/**
 * Parses ApexDocs with HTTP REST annotations and turns them into an OpenApi specification.
 */
export class MethodParser {
  constructor(public openApiModel: OpenApi) {}

  public parseMethod(classMirror: ClassMirror, httpUrlEndpoint: string, httpMethodKey: HttpOperations, tag: string) {
    const classMirrorWrapper = new ClassMirrorWrapper(classMirror);
    // Apex supports HttpGet, HttpPut, HttpPost, HttpDelete, and HttpPatch, so we search for a method
    // that has one of those annotations.
    const httpMethods = classMirrorWrapper.getMethodsByAnnotation(`http${httpMethodKey}`);
    if (!httpMethods.length) {
      return;
    }

    // We can assume there is at most one method per annotation, as this is an Apex rule.
    const httpMethod = httpMethods[0];

    this.openApiModel.paths[httpUrlEndpoint][httpMethodKey] = {};
    this.openApiModel.paths[httpUrlEndpoint][httpMethodKey]!.tags = [tag];
    if (httpMethod.docComment?.description) {
      this.openApiModel.paths[httpUrlEndpoint][httpMethodKey]!.description = httpMethod.docComment.description;
    }
    const methodMirrorWrapper = new MethodMirrorWrapper(httpMethod);
    if (methodMirrorWrapper.hasDocCommentAnnotation('summary')) {
      this.openApiModel.paths[httpUrlEndpoint][httpMethodKey]!.summary =
        methodMirrorWrapper.getDocCommentAnnotation('summary')?.body;
    }

    this.parseHttpAnnotation<ApexDocHttpRequestBody>(
      httpMethod,
      httpUrlEndpoint,
      httpMethodKey,
      'http-request-body',
      this.addRequestBodyToOpenApi.bind(this),
      this.fallbackHttpRequestBodyParser(httpUrlEndpoint, httpMethodKey),
    );

    this.parseHttpAnnotation<ApexDocParameterObject>(
      httpMethod,
      httpUrlEndpoint,
      httpMethodKey,
      'http-parameter',
      this.addParametersToOpenApi.bind(this),
    );

    this.parseHttpAnnotation<ApexDocHttpResponse>(
      httpMethod,
      httpUrlEndpoint,
      httpMethodKey,
      'http-response',
      this.addHttpResponsesToOpenApi.bind(this),
      this.getFallbackHttpResponseParser(httpUrlEndpoint, httpMethodKey),
    );
  }

  private parseHttpAnnotation<T extends ApexDocSchemaAware>(
    httpMethod: MethodMirror,
    urlValue: string,
    httpMethodKey: HttpOperations,
    annotationName: string,
    addToOpenApi: AddToOpenApi<T>,
    fallbackParser?: FallbackMethodParser,
  ) {
    const annotations = httpMethod.docComment?.annotations.filter((annotation) => annotation.name === annotationName);

    if (!annotations?.length) {
      if (fallbackParser) {
        fallbackParser(httpMethod);
      }
      return;
    }

    for (const annotation of annotations) {
      // We expect the ApexDoc data representing this to be in YAML format.
      const inYaml = annotation?.bodyLines.reduce((prev, current) => prev + '\n' + current);

      if (!inYaml) {
        return;
      }

      this.addToOpenApiStrategy<T>(inYaml, urlValue, httpMethodKey, addToOpenApi);
    }
  }

  private addToOpenApiStrategy<T extends ApexDocSchemaAware>(
    inYaml: string,
    urlValue: string,
    httpMethodKey: HttpOperations,
    addToOpenApi: AddToOpenApi<T>,
  ): void {
    // Convert the YAML into a JSON object.
    const inJson = yaml.load(inYaml) as T;
    const requestBodyResponse = new RequestBodyBuilder().build(inJson);

    addToOpenApi(inJson, urlValue, httpMethodKey);

    this.addReference(requestBodyResponse);
  }

  private addRequestBodyToOpenApi(
    input: ApexDocHttpRequestBody,
    urlValue: string,
    httpMethodKey: HttpOperations,
  ): void {
    const requestBodyResponse = new RequestBodyBuilder().build(input);
    this.openApiModel.paths[urlValue][httpMethodKey]!.requestBody = requestBodyResponse.body;
  }

  private addParametersToOpenApi(input: ApexDocParameterObject, urlValue: string, httpMethodKey: HttpOperations): void {
    const parameterObjectResponse = new ParameterObjectBuilder().build(input);

    if (this.openApiModel.paths[urlValue][httpMethodKey]!.parameters === undefined) {
      // If no parameters have been defined yet, initialize the list.
      this.openApiModel.paths[urlValue][httpMethodKey]!.parameters = [];
    }
    this.openApiModel.paths[urlValue][httpMethodKey]!.parameters!.push(parameterObjectResponse.body);
  }

  private addHttpResponsesToOpenApi(input: ApexDocHttpResponse, urlValue: string, httpMethodKey: HttpOperations): void {
    const responseObjectResponse = new ResponsesBuilder().build(input);

    if (this.openApiModel.paths[urlValue][httpMethodKey]!.responses === undefined) {
      this.openApiModel.paths[urlValue][httpMethodKey]!.responses = {};
    }

    this.openApiModel.paths[urlValue][httpMethodKey]!.responses![input.statusCode] = responseObjectResponse.body;
  }

  private fallbackHttpRequestBodyParser(
    httpUrlEndpoint: string,
    httpMethodKey: 'get' | 'put' | 'post' | 'delete' | 'patch',
  ) {
    return (methodMirror: MethodMirror) => {
      // If the Apex method receives parameters, they will be interpreted by Salesforce as a JSON
      // object, with each key of the object being the parameter name.
      const parameters = methodMirror.parameters;

      if (!parameters.length) {
        return;
      }

      const propertiesObject: PropertiesObject = {};
      parameters.forEach((currentParameter) => {
        const propertyKey = currentParameter.name;
        const propertyReference = new ReferenceBuilder().getReferenceType(currentParameter.typeReference);

        propertiesObject[propertyKey] = propertyReference.schema;

        this.addReference({
          reference: {
            entrypointReferenceObject: propertyReference.schema as ReferenceObject,
            referenceComponents: propertyReference.referenceComponents,
          },
        });
      });

      this.openApiModel.paths[httpUrlEndpoint][httpMethodKey]!.requestBody = {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: propertiesObject,
            },
          },
        },
      };
    };
  }

  private getFallbackHttpResponseParser(
    httpUrlEndpoint: string,
    httpMethodKey: 'get' | 'put' | 'post' | 'delete' | 'patch',
  ) {
    return (methodMirror: MethodMirror) => {
      // Parses methods that return an object (as opposed to void).
      const returnType = methodMirror.typeReference;

      if (returnType.type.toLowerCase() === 'void') {
        return;
      }

      const reference = new ReferenceBuilder().getReferenceType(returnType);

      this.addReference({
        reference: {
          entrypointReferenceObject: reference.schema as ReferenceObject,
          referenceComponents: reference.referenceComponents,
        },
      });

      if (this.openApiModel.paths[httpUrlEndpoint][httpMethodKey]!.responses === undefined) {
        this.openApiModel.paths[httpUrlEndpoint][httpMethodKey]!.responses = {};
      }

      // Successful responses with a non-void return type always return a status code of 2000
      this.openApiModel.paths[httpUrlEndpoint][httpMethodKey]!.responses!['200'] = {
        description: methodMirror.docComment?.description ?? 'Status code 200',
        content: {
          'application/json': { schema: reference.schema },
        },
      };
    };
  }

  private addReference(referenceHolder: { reference?: Reference }): void {
    if (referenceHolder.reference) {
      // If a reference is returned, we want to make sure to add it to the OpenApi object as well
      // Add to "component" section if it hasn't been already
      if (this.openApiModel.components === undefined) {
        this.openApiModel.components = {
          schemas: {},
        };
      }

      if (!referenceHolder.reference.referenceComponents.length) {
        return;
      }

      // Add all received references to the OpenApi components section.
      referenceHolder.reference.referenceComponents.forEach((current) => {
        // Check if the referenced object is already part of the OpenApi object
        this.openApiModel.components!.schemas![current.referencedClass] = current.schema;
      });
    }
  }
}
