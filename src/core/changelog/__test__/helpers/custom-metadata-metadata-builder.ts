import { CustomMetadataMetadata } from '../../../reflection/sobject/reflect-custom-metadata-source';

export default class CustomMetadataMetadataBuilder {
  parentName: string = 'MyObject';
  name: string = 'FieldName__c';

  withName(name: string): CustomMetadataMetadataBuilder {
    this.name = name;
    return this;
  }

  build(): CustomMetadataMetadata {
    return {
      type_name: 'custommetadata',
      apiName: `${this.parentName}.${this.name}`,
      protected: false,
      label: 'MyMetadata',
      name: this.name,
      parentName: this.parentName,
    };
  }
}
