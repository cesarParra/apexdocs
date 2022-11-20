import { ClassMirror, MethodMirror } from '@cparra/apex-reflection';
import { OpenApi } from '../../../model/openapi/open-api';
import * as yaml from 'js-yaml';
import {
  ParameterObject,
  PropertiesObject,
  RequestBody,
  SchemaObject,
  SchemaObjectArray,
  SchemaObjectObject,
} from '../../../model/openapi/open-api-types';
import { TypesRepository } from '../../../model/types-repository';
import { ClassMirrorWrapper } from '../../../model/apex-type-wrappers/ClassMirrorWrapper';
import { ApexDocHttpRequestBody, RequestBodyBuilder } from './RequestBodyBuilder';
import { Reference } from './ReferenceBuilder';
import { ApexDocParameterObject, ParameterObjectBuilder } from './ParameterObjectBuilder';

type ApexDocHttpResponse = ApexDocHttpResponseWithoutReference | ApexDocHttpResponseWithReference;

type ApexDocHttpResponseWithoutReference = {
  statusCode: number;
} & (SchemaObjectObject | SchemaObjectArray);

type ApexDocHttpResponseWithReference = {
  statusCode: number;
  schema: string;
};

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
    // TODO: Move to its own class like we did with ParameterObject and RequestBody
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

  private isReferenceString = (targetObject: any): boolean => {
    return typeof targetObject === 'string' || targetObject instanceof String;
  };

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
