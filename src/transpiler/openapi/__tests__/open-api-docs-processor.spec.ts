import { Annotation, ClassMirror, DocComment } from '@cparra/apex-reflection';
import { AnnotationElementValue } from '@cparra/apex-reflection/index';
import { OpenApiDocsProcessor } from '../open-api-docs-processor';
import { Settings, SettingsConfig } from '../../../settings';

class SettingsBuilder {
  build(): SettingsConfig {
    return {
      sourceDirectory: './',
      recursive: true,
      scope: [],
      outputDir: './',
      targetGenerator: 'openapi',
      indexOnly: false,
      defaultGroupName: 'Misc',
      sanitizeHtml: true,
      openApiTitle: 'Apex API',
    };
  }
}

class DocCommentBuilder {
  private description?: string;

  withDescription(description: string): DocCommentBuilder {
    this.description = description;
    return this;
  }

  build(): DocComment {
    return {
      paramAnnotations: [],
      returnAnnotation: {
        bodyLines: [],
      },
      exampleAnnotation: {
        bodyLines: [],
      },
      throwsAnnotations: [],
      annotations: [],
      descriptionLines: [],
      description: this.description ?? 'Sample Description',
    };
  }
}

class AnnotationBuilder {
  elementValues: AnnotationElementValue[] = [];

  addElementValue(elementValue: AnnotationElementValue): AnnotationBuilder {
    this.elementValues.push(elementValue);
    return this;
  }

  build(): Annotation {
    return {
      rawDeclaration: '',
      name: 'restresource',
      type: 'restResource',
      elementValues: this.elementValues,
    };
  }
}

class ClassMirrorBuilder {
  annotations: Annotation[] = [];
  docComment?: DocComment;

  addAnnotation(annotation: Annotation): ClassMirrorBuilder {
    this.annotations.push(annotation);
    return this;
  }

  withDocComment(docComment: DocComment): ClassMirrorBuilder {
    this.docComment = docComment;
    return this;
  }

  build(): ClassMirror {
    return {
      annotations: this.annotations,
      name: 'SampleClass',
      type_name: 'class',
      methods: [],
      implemented_interfaces: [],
      properties: [],
      fields: [],
      constructors: [],
      enums: [],
      interfaces: [],
      classes: [],
      access_modifier: 'public',
      docComment: this.docComment,
    };
  }
}

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

  expect(processor.openApiModel.paths).toHaveProperty('/Account/*');
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

  expect(processor.openApiModel.paths['/Account/*'].description).toBe('My Description');
});
