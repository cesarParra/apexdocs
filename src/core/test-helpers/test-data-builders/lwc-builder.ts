type Property = {
  name: string;
  type?: string;
  required?: boolean;
  label?: string;
  description?: string;
  default?: string;
  target?: string;
}

export class LwcBuilder {
  private name: string = 'TestComponent';
  private description: string = 'Test Lightning Web Component';
  private apiVersion: string = '60.0';
  private isExposed: boolean = true;
  private masterLabel: string = 'Test Component';
  private targets: string[] = ['lightningCommunity__Default'];
  private jsContent: string = '';
  private decoratedProperties: Array<Property> = [];
  private nonDecoratedProperties: Array<Property> = [];

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

  withDecoratedProperty(property: Property): LwcBuilder {
    this.decoratedProperties.push(property);
    return this;
  }

  withNonDecoratedProperty(property: Property): LwcBuilder {
    this.nonDecoratedProperties.push(property);
    return this;
  }

  buildJs(): string {
    if (this.jsContent) {
      return this.jsContent;
    }

    const apiProperties = this.decoratedProperties.map((prop) => `    @api ${prop.name};`).join('\n');
    const nonApiProperties = this.nonDecoratedProperties.map((prop) => `    ${prop.name};`).join('\n');

    return `import { LightningElement, api } from 'lwc';

export default class ${this.name} extends LightningElement {
${apiProperties}
${nonApiProperties}
}`;
  }

  buildMetaXml(): string {
    const targetsXml = this.targets.map((target) => `        <target>${target}</target>`).join('\n');

    const propertiesXml =
      this.decoratedProperties.length > 0
        ? `    <targetConfigs>
${this.buildTargetConfigsXml()}
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

  private buildTargetConfigsXml(): string {
    if (this.decoratedProperties.length === 0) {
      return '';
    }

    // Group properties by target
    const propertiesByTarget = new Map<string, Array<(typeof this.decoratedProperties)[0]>>();

    this.decoratedProperties.forEach((prop) => {
      const target = prop.target || this.targets[0];
      if (!propertiesByTarget.has(target)) {
        propertiesByTarget.set(target, []);
      }
      propertiesByTarget.get(target)!.push(prop);
    });

    // Build XML for each target config
    let targetConfigsXml = '';
    propertiesByTarget.forEach((properties, target) => {
      const propertiesXml = properties
        .map(
          (prop) =>
            `            <property name="${prop.name}" type="${prop.type}" required="${prop.required}" label="${prop.label}" description="${prop.description}"${prop.default ? ` default="${prop.default}"` : ''}/>`,
        )
        .join('\n');

      targetConfigsXml += `        <targetConfig targets="${target}">
${propertiesXml}
        </targetConfig>\n`;
    });

    return targetConfigsXml;
  }
}
