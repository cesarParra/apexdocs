import { Annotation, ClassMirror, DocComment } from '@cparra/apex-reflection';

/**
 * Builder class to create ClassMirror objects.
 * For testing purposes only.
 */
export class ClassMirrorBuilder {
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
