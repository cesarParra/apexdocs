import { DocComment } from '@cparra/apex-reflection';

/**
 * Builder class to create DocComment objects.
 * For testing purposes only.
 */
export class DocCommentBuilder {
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
