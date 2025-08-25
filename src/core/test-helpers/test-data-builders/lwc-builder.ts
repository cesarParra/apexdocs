export class LwcBuilder {
  private name: string = 'TestComponent';
  private description: string = 'Test Lightning Web Component';
  private apiVersion: string = '60.0';
  private isExposed: boolean = true;
  private masterLabel: string = 'Test Component';
  private targets: string[] = ['lightningCommunity__Default'];
  private jsContent: string = '';
  private properties: Array<{
    name: string;
    type: string;
    required: boolean;
    label: string;
    description: string;
    default?: string;
  }> = [];

  withName(name: string): LwcBuilder {
    this.name = name;
    if (this.masterLabel === 'Test Component') {
      this.masterLabel = name;
    }
    return this;
  }

  withDescription(description: string): LwcBuilder {
    this.description = description;
    return this;
  }

  withApiVersion(apiVersion: string): LwcBuilder {
    this.apiVersion = apiVersion;
    return this;
  }

  withIsExposed(isExposed: boolean): LwcBuilder {
    this.isExposed = isExposed;
    return this;
  }

  withMasterLabel(masterLabel: string): LwcBuilder {
    this.masterLabel = masterLabel;
    return this;
  }

  withTargets(targets: string[]): LwcBuilder {
    this.targets = targets;
    return this;
  }

  withJsContent(jsContent: string): LwcBuilder {
    this.jsContent = jsContent;
    return this;
  }

  withProperty(property: {
    name: string;
    type: string;
    required: boolean;
    label: string;
    description: string;
    default?: string;
  }): LwcBuilder {
    this.properties.push(property);
    return this;
  }

  buildJs(): string {
    if (this.jsContent) {
      return this.jsContent;
    }

    const apiProperties = this.properties
      .map(prop => `    @api ${prop.name};`)
      .join('\n');

    return `import { LightningElement, api } from 'lwc';

export default class ${this.name} extends LightningElement {
${apiProperties}
}`;
  }

  buildMetaXml(): string {
    const targetsXml = this.targets
      .map(target => `        <target>${target}</target>`)
      .join('\n');

    const propertiesXml = this.properties.length > 0
      ? `    <targetConfigs>
        <targetConfig targets="${this.targets[0]}">
${this.properties.map(prop => `            <property name="${prop.name}" type="${prop.type}" required="${prop.required}" label="${prop.label}" description="${prop.description}"${prop.default ? ` default="${prop.default}"` : ''}/>`)
  .join('\n')}
        </targetConfig>
    </targetConfigs>`
      : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${this.apiVersion}</apiVersion>
    <description>${this.description}</description>
    <isExposed>${this.isExposed}</isExposed>
    <masterLabel>${this.masterLabel}</masterLabel>
    <targets>
${targetsXml}
    </targets>
${propertiesXml}
</LightningComponentBundle>`;
  }
}
