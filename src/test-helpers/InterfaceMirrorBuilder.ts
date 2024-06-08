import { Annotation, DocComment, InterfaceMirror, MethodMirror } from '@cparra/apex-reflection';

/**
 * Builder class to create Interface objects.
 * For testing purposes only.
 */
export class InterfaceMirrorBuilder {
  private name = 'SampleClass';
  private annotations: Annotation[] = [];
  private docComment?: DocComment;
  private methods: MethodMirror[] = [];

  withName(name: string): InterfaceMirrorBuilder {
    this.name = name;
    return this;
  }

  addAnnotation(annotation: Annotation): InterfaceMirrorBuilder {
    this.annotations.push(annotation);
    return this;
  }

  withDocComment(docComment: DocComment): InterfaceMirrorBuilder {
    this.docComment = docComment;
    return this;
  }

  addMethod(method: MethodMirror): InterfaceMirrorBuilder {
    this.methods.push(method);
    return this;
  }

  build(): InterfaceMirror {
    return {
      annotations: this.annotations,
      name: this.name,
      type_name: 'interface',
      methods: this.methods,
      access_modifier: 'public',
      docComment: this.docComment,
      extended_interfaces: [],
    };
  }
}
