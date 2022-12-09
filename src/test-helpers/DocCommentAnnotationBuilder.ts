import { DocCommentAnnotation } from '@cparra/apex-reflection';

export class DocCommentAnnotationBuilder {
  private name = '';

  withName(name: string): DocCommentAnnotationBuilder {
    this.name = name;
    return this;
  }

  build(): DocCommentAnnotation {
    return {
      name: this.name,
      body: '',
      bodyLines: [],
    };
  }
}
