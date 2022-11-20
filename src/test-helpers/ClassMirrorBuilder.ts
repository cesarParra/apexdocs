import { Annotation, ClassMirror, DocComment, MethodMirror } from '@cparra/apex-reflection';

/**
 * Builder class to create ClassMirror objects.
 * For testing purposes only.
 */
export class ClassMirrorBuilder {
  private annotations: Annotation[] = [];
  private docComment?: DocComment;
  private methods: MethodMirror[] = [];

  addAnnotation(annotation: Annotation): ClassMirrorBuilder {
    this.annotations.push(annotation);
    return this;
  }

  withDocComment(docComment: DocComment): ClassMirrorBuilder {
    this.docComment = docComment;
    return this;
  }

  addMethod(method: MethodMirror): ClassMirrorBuilder {
    this.methods.push(method);
    return this;
  }

  build(): ClassMirror {
    return {
      annotations: this.annotations,
      name: 'SampleClass',
      type_name: 'class',
      methods: this.methods,
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
