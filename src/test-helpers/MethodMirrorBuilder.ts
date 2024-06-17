import { Annotation, DocComment, MethodMirror, ParameterMirror } from '@cparra/apex-reflection';

type Parameter = ParameterMirror;

export class MethodMirrorBuilder {
  private name = 'sampleMethod';
  private annotations: Annotation[] = [];
  private docComment?: DocComment;
  private typeReference: { type: string; rawDeclaration: string } = {
    type: 'void',
    rawDeclaration: 'void',
  };
  private parameters: Parameter[] = [];

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

  withTypeReference(param: { type: string; rawDeclaration: string }) {
    this.typeReference = param;
    return this;
  }

  addParameter(parameter: Parameter): MethodMirrorBuilder {
    this.parameters.push(parameter);
    return this;
  }

  build(): MethodMirror {
    return {
      access_modifier: 'public',
      annotations: this.annotations,
      name: this.name,
      memberModifiers: [],
      typeReference: this.typeReference,
      parameters: this.parameters,
      docComment: this.docComment,
    };
  }
}

export class ParameterBuilder {
  private name = 'param';
  private typeReference: { type: string; rawDeclaration: string } = {
    type: 'String',
    rawDeclaration: 'String',
  };

  withName(name: string): ParameterBuilder {
    this.name = name;
    return this;
  }

  withTypeReference(param: { type: string; rawDeclaration: string }) {
    this.typeReference = param;
    return this;
  }

  build(): Parameter {
    return {
      memberModifiers: [],
      name: this.name,
      typeReference: this.typeReference,
    };
  }
}
