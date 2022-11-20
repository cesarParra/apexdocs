import { Annotation, AnnotationElementValue } from '@cparra/apex-reflection';

/**
 * Builder class to create Annotation objects.
 * For testing purposes only.
 */
export class AnnotationBuilder {
  private name = 'restresource';
  private elementValues: AnnotationElementValue[] = [];

  withName(name: string): AnnotationBuilder {
    this.name = name;
    return this;
  }

  addElementValue(elementValue: AnnotationElementValue): AnnotationBuilder {
    this.elementValues.push(elementValue);
    return this;
  }

  build(): Annotation {
    return {
      rawDeclaration: '',
      name: this.name,
      type: this.name,
      elementValues: this.elementValues,
    };
  }
}
