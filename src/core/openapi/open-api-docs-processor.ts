import { FileContainer } from './file-container';
import { ClassMirror, Type } from '@cparra/apex-reflection';
import { Logger } from '#utils/logger';
import { OpenApi } from './open-api';
import { OpenApiSettings } from './openApiSettings';
import { MethodParser } from './parsers/MethodParser';
import { camel2title } from '#utils/string-utils';
import { createOpenApiFile } from './openapi-type-file';
import { ApexDocParameterObject } from './apex-doc-types';
import { MethodMirrorWrapper } from './apex-type-wrappers/MethodMirrorWrapper';

export class OpenApiDocsProcessor {
  protected readonly _fileContainer: FileContainer;
  openApiModel: OpenApi;

  constructor(private logger: Logger) {
    this._fileContainer = new FileContainer();
    const title = OpenApiSettings.getInstance().getOpenApiTitle();
    if (!title) {
      throw Error('No OpenApi title was provided.');
    }
    this.openApiModel = new OpenApi(
      title,
      OpenApiSettings.getInstance().getVersion(),
      OpenApiSettings.getInstance().getNamespace(),
    );
  }

  fileBuilder(): FileContainer {
    return this._fileContainer;
  }

  onProcess(type: Type): void {
    // We can safely cast to a ClassMirror, since only these support the @RestResource annotation
    const typeAsClass = type as ClassMirror;

    const endpoint = this.getEndpoint(typeAsClass);
    if (!endpoint) {
      return;
    }
    const { path: endpointPath, tagName } = endpoint;

    this.openApiModel.paths[endpointPath] = {};
    if (type.docComment?.description) {
      this.openApiModel.paths[endpointPath].description = type.docComment.description;
    }

    // Add tags for this Apex class to the OpenApi model
    this.openApiModel.tags.push({
      name: tagName,
      description: type.docComment?.description,
    });

    const parser = new MethodParser(this.openApiModel);

    // GET
    parser.parseMethod(typeAsClass, endpointPath, 'get', tagName);

    // PATCH
    parser.parseMethod(typeAsClass, endpointPath, 'patch', tagName);

    // POST
    parser.parseMethod(typeAsClass, endpointPath, 'post', tagName);

    // PUT
    parser.parseMethod(typeAsClass, endpointPath, 'put', tagName);

    // DELETE
    parser.parseMethod(typeAsClass, endpointPath, 'delete', tagName);
  }

  onAfterProcess: ((types: Type[]) => void) | undefined = () => {
    const page = createOpenApiFile(OpenApiSettings.getInstance().openApiFileName(), this.openApiModel);
    this._fileContainer.pushFile(page);
  };

  private getEndpoint(type: ClassMirror): { path: string; tagName: string } | null {
    const restResourceAnnotation = type.annotations.find((element) => element.name.toLowerCase() === 'restresource');
    const urlMapping = restResourceAnnotation?.elementValues?.find(
      (element) => element.key.toLowerCase() === 'urlmapping',
    );
    if (!urlMapping) {
      this.logger.error(`Type does not contain urlMapping annotation ${type.name}`);
      return null;
    }

    // The OpenApi path needs to start with a leading slash, but
    // Salesforce @RestResource annotations already require a leading slash,
    // so no need to check for it.
    // See URL Guidelines: https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_annotation_rest_resource.htm
    const rawPath = urlMapping.value.replaceAll('"', '').replaceAll("'", '');
    const segments = rawPath.split('/');

    // Salesforce allows wildcards (*) in URL mappings, but these are not valid in an OpenApi path.
    // We transform each wildcard into a path template parameter, matching them in order with
    // the path parameters declared through @http-parameter doc annotations.
    // See https://spec.openapis.org/oas/v3.1.0#parameter-locations
    const parameterNames = segments.includes('*') ? this.getPathParameterNames(type) : [];
    let wildcardIndex = 0;
    let fallbackIndex = 0;
    const path = segments
      .map((segment) =>
        segment === '*' ? `{${parameterNames[wildcardIndex++] ?? `param${++fallbackIndex}`}}` : segment,
      )
      .join('/');

    // The tag name is derived from the path without its wildcards, to keep it readable.
    return { path, tagName: camel2title(segments.filter((segment) => segment !== '*').join('/')) };
  }

  /**
   * Returns the names of all parameters declared as `in: path` through @http-parameter
   * doc annotations on the class's methods, in the order the methods are declared.
   */
  private getPathParameterNames(type: ClassMirror): string[] {
    const names = type.methods
      .flatMap((method) =>
        new MethodMirrorWrapper(method).getDocCommentAnnotationsAs<ApexDocParameterObject>('http-parameter'),
      )
      .filter((parameter) => parameter.in === 'path' && parameter.name)
      .map((parameter) => parameter.name);
    return [...new Set(names)];
  }
}
