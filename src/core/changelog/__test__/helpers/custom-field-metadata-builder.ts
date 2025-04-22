import { CustomFieldMetadata } from '../../../reflection/sobject/reflect-custom-field-source';

export default class CustomFieldMetadataBuilder {
  name: string = 'MyField';
  description: string | null = null;

  withName(name: string): CustomFieldMetadataBuilder {
    this.name = name;
    return this;
  }

  withDescription(testDescription: string) {
    this.description = testDescription;
    return this;
  }

  build(): CustomFieldMetadata {
    return {
      type: 'Text',
      type_name: 'customfield',
      label: 'MyField',
      name: this.name,
      description: this.description,
      parentName: 'MyObject',
      required: false,
      securityClassification: 'Internal',
      complianceGroup: 'PII',
      inlineHelpText: 'An image in either one of the following formats: JPEG, SVG, or PNG. For best results the image should be under 1MB in size.',
    };
  }
}
