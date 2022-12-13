import { DocCommentAnnotation } from '@cparra/apex-reflection';

export class DocCommentAnnotationBuilder {
  private name = '';
  private bodyLines: string[] = [];

  withName(name: string): DocCommentAnnotationBuilder {
    this.name = name;
    return this;
  }

  withBodyLines(bodyLines: string[]): DocCommentAnnotationBuilder {
    this.bodyLines = bodyLines;
    return this;
  }

  build(): DocCommentAnnotation {
    return {
      name: this.name,
      body: '',
      bodyLines: this.bodyLines,
    };
  }
}
