export class CustomObjectXmlBuilder {
  deploymentStatus = 'Deployed';
  visibility = 'Public';
  label = 'MyTestObject';
  fields: InlineFieldBuilder[] = [];

  withDeploymentStatus(deploymentStatus: string): CustomObjectXmlBuilder {
    this.deploymentStatus = deploymentStatus;
    return this;
  }

  withVisibility(visibility: string): CustomObjectXmlBuilder {
    this.visibility = visibility;
    return this;
  }

  withLabel(label: string): CustomObjectXmlBuilder {
    this.label = label;
    return this;
  }

  withFields(fields: InlineFieldBuilder[]): CustomObjectXmlBuilder {
    this.fields = fields;
    return this;
  }

  build(): string {
    return `
    <?xml version="1.0" encoding="UTF-8"?>
    <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
        <deploymentStatus>${this.deploymentStatus}</deploymentStatus>
        <description>test object for testing</description>
        <label>${this.label}</label>
        <pluralLabel>MyFirstObjects</pluralLabel>
        <visibility>${this.visibility}</visibility>
        ${this.fields.map((field) => field.build()).join('')}
    </CustomObject>`;
  }
}

export class InlineFieldBuilder {
  fullName = 'TestField__c';
  description = 'Test field for testing';
  label = 'TestField';
  type = 'Text';

  withFullName(fullName: string): InlineFieldBuilder {
    this.fullName = fullName;
    return this;
  }

  withDescription(description: string): InlineFieldBuilder {
    this.description = description;
    return this;
  }

  withLabel(label: string): InlineFieldBuilder {
    this.label = label;
    return this;
  }

  withType(type: string): InlineFieldBuilder {
    this.type = type;
    return this;
  }

  build(): string {
    return `
      <fields>
          <fullName>${this.fullName}</fullName>
          <description>${this.description}</description>
          <label>${this.label}</label>
          <type>${this.type}</type>
      </fields>`;
  }
}
