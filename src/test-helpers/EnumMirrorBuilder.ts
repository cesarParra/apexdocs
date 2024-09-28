import { Annotation, DocComment, EnumMirror } from '@cparra/apex-reflection';

/**
 * Builder class to create Enum objects.
 * For testing purposes only.
 */
export class EnumMirrorBuilder {
  private name = 'SampleEnum';
  private annotations: Annotation[] = [];
  private docComment?: DocComment;

  withName(name: string): EnumMirrorBuilder {
    this.name = name;
    return this;
  }

  addAnnotation(annotation: Annotation): EnumMirrorBuilder {
    this.annotations.push(annotation);
    return this;
  }

  build(): EnumMirror {
    return {
      annotations: this.annotations,
      name: this.name,
      type_name: 'enum',
      access_modifier: 'public',
      docComment: this.docComment,
      values: [],
    };
  }
}
