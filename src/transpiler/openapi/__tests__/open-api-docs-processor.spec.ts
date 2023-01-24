import { OpenApiDocsProcessor } from '../open-api-docs-processor';
import { Settings } from '../../../settings';
import { SettingsBuilder } from '../../../test-helpers/SettingsBuilder';
import { DocCommentBuilder } from '../../../test-helpers/DocCommentBuilder';
import { AnnotationBuilder } from '../../../test-helpers/AnnotationBuilder';
import { ClassMirrorBuilder } from '../../../test-helpers/ClassMirrorBuilder';

beforeEach(() => {
  Settings.build(new SettingsBuilder().build());
});

it('should add a path based on the @UrlResource annotation on the class', function () {
  const annotationElementValue = {
    key: 'urlMapping',
    value: "'/Account/*'",
  };
  const classMirror = new ClassMirrorBuilder()
    .addAnnotation(new AnnotationBuilder().addElementValue(annotationElementValue).build())
    .build();

  const processor = new OpenApiDocsProcessor();
  processor.onProcess(classMirror);

  expect(processor.openApiModel.paths).toHaveProperty('Account/');
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

  const processor = new OpenApiDocsProcessor();
  processor.onProcess(classMirror);

  expect(processor.openApiModel.paths['Account/'].description).toBe('My Description');
});
