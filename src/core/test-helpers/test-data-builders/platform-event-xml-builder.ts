import { PublishBehavior } from '../../reflection/sobject/reflect-custom-object-sources';

export class PlatformEventXmlBuilder {
  deploymentStatus = 'Deployed';
  publishBehavior: PublishBehavior = 'PublishImmediately';
  label = 'MyTestObject';

  withPublishBehavior(publishBehavior: PublishBehavior): PlatformEventXmlBuilder {
    this.publishBehavior = publishBehavior;
    return this;
  }

  build(): string {
    return `
    <?xml version="1.0" encoding="UTF-8"?>
    <CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
        <deploymentStatus>${this.deploymentStatus}</deploymentStatus>
        <description>Eu exceptincididunt anicat aut</description>
        <eventType>HighVolume</eventType>
        <label>${this.label}</label>
        <pluralLabel>Sample Platform Events</pluralLabel>
        <publishBehavior>${this.publishBehavior}</publishBehavior>
    </CustomObject>
    `;
  }
}
