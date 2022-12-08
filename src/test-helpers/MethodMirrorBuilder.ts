import { Annotation, DocComment, MethodMirror } from '@cparra/apex-reflection';

export class MethodMirrorBuilder {
  private name = 'sampleMethod';
  private annotations: Annotation[] = [];
  private docComment?: DocComment;

  withName(name: string): MethodMirrorBuilder {
    this.name = name;
    return this;
  }

  addAnnotation(annotation: Annotation): MethodMirrorBuilder {
    this.annotations.push(annotation);
    return this;
  }

  withDocComment(docComment: DocComment): MethodMirrorBuilder {
    this.docComment = docComment;
    return this;
  }

  build(): MethodMirror {
    return {
      access_modifier: 'public',
      annotations: this.annotations,
      name: this.name,
      memberModifiers: [],
      typeReference: {
        type: 'void',
        rawDeclaration: 'void',
      },
      parameters: [],
      docComment: this.docComment,
    };
  }
}
