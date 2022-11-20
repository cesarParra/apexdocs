import { Annotation, AnnotationElementValue } from '@cparra/apex-reflection';

/**
 * Builder class to create Annotation objects.
 * For testing purposes only.
 */
export class AnnotationBuilder {
  elementValues: AnnotationElementValue[] = [];

  addElementValue(elementValue: AnnotationElementValue): AnnotationBuilder {
    this.elementValues.push(elementValue);
    return this;
  }

  build(): Annotation {
    return {
      rawDeclaration: '',
      name: 'restresource',
      type: 'restResource',
      elementValues: this.elementValues,
    };
  }
}
