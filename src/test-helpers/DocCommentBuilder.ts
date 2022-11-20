import { DocComment, DocCommentAnnotation } from '@cparra/apex-reflection';

/**
 * Builder class to create DocComment objects.
 * For testing purposes only.
 */
export class DocCommentBuilder {
  private description?: string;
  private annotations: DocCommentAnnotation[] = [];

  addAnnotation(annotation: DocCommentAnnotation): DocCommentBuilder {
    this.annotations.push(annotation);
    return this;
  }

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
      annotations: this.annotations,
      descriptionLines: [],
      description: this.description ?? 'Sample Description',
    };
  }
}
