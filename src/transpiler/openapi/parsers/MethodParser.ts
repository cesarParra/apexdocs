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

type AddToOpenApi = (inYaml: string, urlValue: string) => void;

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

    this.parseHttpAnnotation(httpMethod, httpUrlEndpoint, 'http-request-body', (inYaml, urlValue) =>
      this.addRequestBodyToOpenApi(inYaml, urlValue, httpMethodKey),
    );
    this.parseHttpAnnotation(httpMethod, httpUrlEndpoint, 'http-parameter', (inYaml, urlValue) =>
      this.addParametersToOpenApi(inYaml, urlValue, httpMethodKey),
    );
    this.parseHttpAnnotation(httpMethod, httpUrlEndpoint, 'http-response', (inYaml, urlValue) =>
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
    const requestBodyResponse = new RequestBodyBuilder().build(inJson);

    this.openApiModel.paths[urlValue][httpMethodKey]!.requestBody = requestBodyResponse.requestBody;
    if (requestBodyResponse.reference) {
      // If a reference is returned, we want to make sure to add it to the OpenApi object as well
      this.addReference(requestBodyResponse.reference);
    }
  }

  private addParametersToOpenApi(inYaml: string, urlValue: string, httpMethodKey: HttpOperations) {
    // Convert the YAML into a JSON object.
    const inJson = yaml.load(inYaml) as ApexDocParameterObject;
    const parameterObjectResponse = new ParameterObjectBuilder().build(inJson);

    if (this.openApiModel.paths[urlValue][httpMethodKey]!.parameters === undefined) {
      // If no parameters have been defined yet, initialize the list.
      this.openApiModel.paths[urlValue][httpMethodKey]!.parameters = [];
    }
    this.openApiModel.paths[urlValue][httpMethodKey]!.parameters!.push(parameterObjectResponse.parameterObject);
    if (parameterObjectResponse.reference) {
      // If a reference is returned, we want to make sure to add it to the OpenApi object as well
      this.addReference(parameterObjectResponse.reference);
    }
  }

  private addHttpResponsesToOpenApi(inYaml: string, urlValue: string, httpMethodKey: HttpOperations) {
    // Convert the YAML into a JSON object.
    const inJson = yaml.load(inYaml) as ApexDocHttpResponse;
    const responseObjectResponse = new ResponsesBuilder().build(inJson);

    if (this.openApiModel.paths[urlValue][httpMethodKey]!.responses === undefined) {
      this.openApiModel.paths[urlValue][httpMethodKey]!.responses = {};
    }

    this.openApiModel.paths[urlValue][httpMethodKey]!.responses![inJson.statusCode] = responseObjectResponse.response;
    // TODO: There's some duplication with the next 3 lines, because we do the same in all 3 places
    if (responseObjectResponse.reference) {
      // If a reference is returned, we want to make sure to add it to the OpenApi object as well
      this.addReference(responseObjectResponse.reference);
    }
  }

  private addReference(reference: Reference): void {
    // Add to "component" section if it hasn't been already
    if (this.openApiModel.components === undefined) {
      this.openApiModel.components = {
        schemas: {},
      };
    }

    // Check if the referenced object is already part of the OpenApi object
    if (this.openApiModel.components.schemas![reference.referencedClass]) {
      return;
    }

    // If it isn't, then add it
    this.openApiModel.components.schemas![reference.referencedClass] = reference.schema;
  }
}
