import { ClassMirror, MethodMirror } from '@cparra/apex-reflection';
import { OpenApi } from '../../../model/openapi/open-api';
import * as yaml from 'js-yaml';
import { ClassMirrorWrapper } from '../../../model/apex-type-wrappers/ClassMirrorWrapper';
import { Reference } from './ReferenceBuilder';
import { ParameterObjectBuilder } from './ParameterObjectBuilder';
import { ResponsesBuilder } from './ResponsesBuilder';
import {
  ApexDocHttpRequestBody,
  ApexDocHttpResponse,
  ApexDocParameterObject,
} from '../../../model/openapi/apex-doc-types';
import { RequestBodyBuilder } from './RequestBodyBuilder';
import { ApexDocSchemaAware } from './Builder';

type FallbackMethodParser = (methodMirror: MethodMirror) => void;
type AddToOpenApi<T extends ApexDocSchemaAware> = (input: T, urlValue: string, httpMethodKey: HttpOperations) => void;

type HttpOperations = 'get' | 'put' | 'post' | 'delete' | 'patch';

/**
 * Parses ApexDocs with HTTP REST annotations and turns them into an OpenApi specification.
 */
export class MethodParser {
  constructor(public openApiModel: OpenApi) {}

  public parseMethod(classMirror: ClassMirror, httpUrlEndpoint: string, httpMethodKey: HttpOperations) {
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
    if (httpMethod.docComment?.description) {
      this.openApiModel.paths[httpUrlEndpoint][httpMethodKey]!.description = httpMethod.docComment.description;
    }

    this.parseHttpAnnotation<ApexDocHttpRequestBody>(
      httpMethod,
      httpUrlEndpoint,
      httpMethodKey,
      'http-request-body',
      this.addRequestBodyToOpenApi,
    );

    this.parseHttpAnnotation<ApexDocParameterObject>(
      httpMethod,
      httpUrlEndpoint,
      httpMethodKey,
      'http-parameter',
      this.addParametersToOpenApi,
    );

    this.parseHttpAnnotation<ApexDocHttpResponse>(
      httpMethod,
      httpUrlEndpoint,
      httpMethodKey,
      'http-response',
      this.addHttpResponsesToOpenApi,
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
      return;
    }

    for (const annotation of annotations) {
      // We expect the ApexDoc data representing this to be in YAML format.
      const inYaml = annotation?.bodyLines.reduce((prev, current, _) => prev + '\n' + current);

      if (!inYaml) {
        return;
      }

      if (fallbackParser) {
        // TODO:
        fallbackParser(httpMethod);
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
