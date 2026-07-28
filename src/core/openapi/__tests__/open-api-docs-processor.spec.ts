import { OpenApiDocsProcessor } from '../open-api-docs-processor';
import { OpenApiSettings } from '../openApiSettings';
import { SettingsBuilder } from '../../../test-helpers/SettingsBuilder';
import { DocCommentBuilder } from '../../../test-helpers/DocCommentBuilder';
import { DocCommentAnnotationBuilder } from '../../../test-helpers/DocCommentAnnotationBuilder';
import { AnnotationBuilder } from '../../../test-helpers/AnnotationBuilder';
import { ClassMirrorBuilder } from '../../../test-helpers/ClassMirrorBuilder';
import { MethodMirrorBuilder } from '../../../test-helpers/MethodMirrorBuilder';
import { NoLogger } from '#utils/logger';
import { DocCommentAnnotation } from '@cparra/apex-reflection';

const noLogger = new NoLogger();

beforeEach(() => {
  OpenApiSettings.build(new SettingsBuilder().build());
});

it('should add a path based on the @UrlResource annotation on the class', function () {
  const annotationElementValue = {
    key: 'urlMapping',
    value: "'/Account/*'",
  };
  const classMirror = new ClassMirrorBuilder()
    .addAnnotation(new AnnotationBuilder().addElementValue(annotationElementValue).build())
    .build();

  const processor = new OpenApiDocsProcessor(noLogger);
  processor.onProcess(classMirror);

  expect(processor.openApiModel.paths).toHaveProperty('/Account/{param1}');
});

it('should respect slashes', function () {
  const annotationElementValue = {
    key: 'urlMapping',
    value: "'/v1/Account/*'",
  };
  const classMirror = new ClassMirrorBuilder()
    .addAnnotation(new AnnotationBuilder().addElementValue(annotationElementValue).build())
    .build();

  const processor = new OpenApiDocsProcessor(noLogger);
  processor.onProcess(classMirror);

  expect(processor.openApiModel.paths).toHaveProperty('/v1/Account/{param1}');
});

it('should contain a path with a description when the class has an ApexDoc comment', function () {
  const annotationElementValue = {
    key: 'urlMapping',
    value: "'/Account/*'",
  };
  const classMirror = new ClassMirrorBuilder()
    .addAnnotation(new AnnotationBuilder().addElementValue(annotationElementValue).build())
    .withDocComment(new DocCommentBuilder().withDescription('My Description').build())
    .build();

  const processor = new OpenApiDocsProcessor(noLogger);
  processor.onProcess(classMirror);

  expect(processor.openApiModel.paths['/Account/{param1}'].description).toBe('My Description');
});

function httpParameter(name: string, location: 'path' | 'query' = 'path'): DocCommentAnnotation {
  return new DocCommentAnnotationBuilder()
    .withName('http-parameter')
    .withBodyLines([`in: ${location}`, `name: ${name}`, 'schema:', '  type: string'])
    .build();
}

function process(urlMapping: string, parameters: DocCommentAnnotation[]): OpenApiDocsProcessor {
  const docComment = parameters.reduce(
    (builder, parameter) => builder.addAnnotation(parameter),
    new DocCommentBuilder(),
  );
  const method = new MethodMirrorBuilder()
    .addAnnotation(new AnnotationBuilder().withName('HttpGet').build())
    .withDocComment(docComment.build())
    .build();
  const classMirror = new ClassMirrorBuilder()
    .addAnnotation(new AnnotationBuilder().addElementValue({ key: 'urlMapping', value: `'${urlMapping}'` }).build())
    .addMethod(method)
    .build();

  const processor = new OpenApiDocsProcessor(noLogger);
  processor.onProcess(classMirror);
  return processor;
}

it.each([
  [
    'a declared path parameter',
    '/accounts/*/generate-report',
    [httpParameter('accountId')],
    '/accounts/{accountId}/generate-report',
  ],
  [
    'multiple path parameters, in order',
    '/accounts/*/contacts/*',
    [httpParameter('accountId'), httpParameter('contactId')],
    '/accounts/{accountId}/contacts/{contactId}',
  ],
  [
    'generic names when there are more wildcards than parameters',
    '/accounts/*/contacts/*',
    [httpParameter('accountId')],
    '/accounts/{accountId}/contacts/{param1}',
  ],
  ['non-path parameters ignored', '/accounts/*', [httpParameter('filter', 'query')], '/accounts/{param1}'],
])('should replace wildcards with path templates using %s', function (_name, urlMapping, parameters, expected) {
  expect(process(urlMapping, parameters).openApiModel.paths).toHaveProperty(expected);
});

it('should not include parameter placeholders in the tag name', function () {
  const processor = process('/accounts/*/generate-report', [httpParameter('accountId')]);

  expect(processor.openApiModel.tags).toEqual([{ name: 'Accounts Generate-Report', description: undefined }]);
});
