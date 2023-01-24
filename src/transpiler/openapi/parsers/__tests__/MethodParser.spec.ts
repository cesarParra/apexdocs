import { ClassMirrorBuilder } from '../../../../test-helpers/ClassMirrorBuilder';
import { MethodMirrorBuilder } from '../../../../test-helpers/MethodMirrorBuilder';
import { AnnotationBuilder } from '../../../../test-helpers/AnnotationBuilder';
import { OpenApi } from '../../../../model/openapi/open-api';
import { MethodParser } from '../MethodParser';
import { DocCommentBuilder } from '../../../../test-helpers/DocCommentBuilder';

it('should add an endpoint when there is an HTTP method', function () {
  const urlEndpoint = '/accounts';

  const classWithGetMethod = new ClassMirrorBuilder()
    .addMethod(new MethodMirrorBuilder().addAnnotation(new AnnotationBuilder().withName('httpget').build()).build())
    .build();

  const openApi = new OpenApi('Title', '1.0');
  openApi.paths[urlEndpoint] = {};

  expect(openApi.paths[urlEndpoint]).not.toHaveProperty('get');

  new MethodParser(openApi).parseMethod(classWithGetMethod, urlEndpoint, 'get', '');

  expect(openApi.paths[urlEndpoint]).toHaveProperty('get');
});

it('should add an endpoint with a description when the method has an ApexDoc', function () {
  const urlEndpoint = '/accounts';

  const classWithGetMethod = new ClassMirrorBuilder()
    .addMethod(
      new MethodMirrorBuilder()
        .addAnnotation(new AnnotationBuilder().withName('httpget').build())
        .withDocComment(new DocCommentBuilder().withDescription('Sample Description').build())
        .build(),
    )
    .build();

  const openApi = new OpenApi('Title', '1.0');
  openApi.paths[urlEndpoint] = {};

  new MethodParser(openApi).parseMethod(classWithGetMethod, urlEndpoint, 'get', '');

  expect(openApi.paths[urlEndpoint]).toHaveProperty('get');
  expect(openApi.paths[urlEndpoint]['get']!.description).toBe('Sample Description');
});
