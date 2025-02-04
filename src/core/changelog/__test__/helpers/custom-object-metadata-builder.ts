import { CustomFieldMetadata } from '../../../reflection/sobject/reflect-custom-field-source';
import { CustomObjectMetadata } from '../../../reflection/sobject/reflect-custom-object-sources';
import { CustomMetadataMetadata } from '../../../reflection/sobject/reflect-custom-metadata-source';

export default class CustomObjectMetadataBuilder {
  label: string = 'MyObject';
  fields: CustomFieldMetadata[] = [];
  metadataRecords: CustomMetadataMetadata[] = [];

  withField(field: CustomFieldMetadata): CustomObjectMetadataBuilder {
    this.fields.push(field);
    return this;
  }

  withMetadataRecord(metadataRecord: CustomMetadataMetadata): CustomObjectMetadataBuilder {
    this.metadataRecords.push(metadataRecord);
    return this;
  }

  build(): CustomObjectMetadata {
    return {
      type_name: 'customobject',
      deploymentStatus: 'Deployed',
      visibility: 'Public',
      label: this.label,
      name: 'MyObject',
      description: null,
      fields: this.fields,
      metadataRecords: this.metadataRecords,
    };
  }
}
