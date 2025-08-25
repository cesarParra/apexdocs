import { assertEither } from '../../test-helpers/assert-either';
import { extendExpect } from './expect-extensions';
import { generateDocs, unparsedLwcBundleFromRawString } from './test-helpers';
import { LwcBuilder } from '../../test-helpers/test-data-builders/lwc-builder';

describe('When generating LWC documentation', () => {
  beforeAll(() => {
    extendExpect();
  });

  describe('basic LWC documentation generation', () => {
    it('generates documentation for a simple LWC component', async () => {
      const lwcBuilder = new LwcBuilder().withName('SimpleButton').withDescription('A simple button component');

      const lwcBundle = unparsedLwcBundleFromRawString({
        jsContent: lwcBuilder.buildJs(),
        xmlContent: lwcBuilder.buildMetaXml(),
        filePath: 'force-app/main/default/lwc/simpleButton/simpleButton.js',
        name: 'SimpleButton',
      });

      const result = await generateDocs([lwcBundle])();

      assertEither(result, (data) => {
        expect(data.docs).toHaveLength(1);
        const doc = data.docs[0];
        expect(doc.source.name).toBe('SimpleButton');
        expect(doc.source.type).toBe('lwc');
        expect(doc.outputDocPath).toContain('lightning-web-components');
        expect(doc.outputDocPath).toContain('SimpleButton.md');
      });
    });

    it('includes the LWC suffix in the heading', async () => {
      const lwcBuilder = new LwcBuilder().withName('CustomCard').withDescription('A custom card component');

      const lwcBundle = unparsedLwcBundleFromRawString({
        jsContent: lwcBuilder.buildJs(),
        xmlContent: lwcBuilder.buildMetaXml(),
        filePath: 'force-app/main/default/lwc/customCard/customCard.js',
        name: 'CustomCard',
      });

      const result = await generateDocs([lwcBundle])();

      assertEither(result, (data) => {
        expect(data).firstDocContains('CustomCard (LWC)');
      });
    });

    it('generates documentation for LWC with @api properties', async () => {
      const complexJsContent = `import { LightningElement, api } from 'lwc';

export default class DataDisplay extends LightningElement {
    @api recordId;
    @api variant = 'base';
    @api size = 'medium';
    @api disabled = false;

    handleClick() {
        this.dispatchEvent(new CustomEvent('select', {
            detail: { recordId: this.recordId }
        }));
    }
}`;

      const lwcBuilder = new LwcBuilder()
        .withName('DataDisplay')
        .withDescription('Displays data in various formats')
        .withJsContent(complexJsContent)
        .withProperty({
          name: 'recordId',
          type: 'String',
          required: true,
          label: 'Record ID',
          description: 'The ID of the record to display',
        })
        .withProperty({
          name: 'variant',
          type: 'String',
          required: false,
          label: 'Variant',
          description: 'The visual variant of the component',
          default: 'base',
        });

      const lwcBundle = unparsedLwcBundleFromRawString({
        jsContent: complexJsContent,
        xmlContent: lwcBuilder.buildMetaXml(),
        filePath: 'force-app/main/default/lwc/dataDisplay/dataDisplay.js',
        name: 'DataDisplay',
      });

      const result = await generateDocs([lwcBundle])();

      assertEither(result, (data) => {
        expect(data.docs).toHaveLength(1);
        const doc = data.docs[0];
        expect(doc.source.name).toBe('DataDisplay');
        expect(doc.source.type).toBe('lwc');
      });
    });

    it('generates documentation for LWC with wire decorators', async () => {
      const wireJsContent = `import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

export default class RecordViewer extends LightningElement {
    @api recordId;
    @api objectApiName;

    @wire(getRecord, { recordId: '$recordId', fields: ['Account.Name'] })
    record;

    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    objectInfo;

    get displayValue() {
        return this.record?.data?.fields?.Name?.value;
    }
}`;

      const lwcBuilder = new LwcBuilder()
        .withName('RecordViewer')
        .withDescription('Views record data using Lightning Data Service')
        .withJsContent(wireJsContent);

      const lwcBundle = unparsedLwcBundleFromRawString({
        jsContent: wireJsContent,
        xmlContent: lwcBuilder.buildMetaXml(),
        filePath: 'force-app/main/default/lwc/recordViewer/recordViewer.js',
        name: 'RecordViewer',
      });

      const result = await generateDocs([lwcBundle])();

      assertEither(result, (data) => {
        expect(data.docs).toHaveLength(1);
        expect(data).firstDocContains('RecordViewer (LWC)');
      });
    });
  });

  describe('LWC component grouping and organization', () => {
    it('places all LWC components in the lightning-web-components folder', async () => {
      const component1 = new LwcBuilder().withName('ComponentOne');
      const component2 = new LwcBuilder().withName('ComponentTwo');

      const bundle1 = unparsedLwcBundleFromRawString({
        jsContent: component1.buildJs(),
        xmlContent: component1.buildMetaXml(),
        filePath: 'force-app/main/default/lwc/componentOne/componentOne.js',
        name: 'ComponentOne',
      });

      const bundle2 = unparsedLwcBundleFromRawString({
        jsContent: component2.buildJs(),
        xmlContent: component2.buildMetaXml(),
        filePath: 'force-app/main/default/lwc/componentTwo/componentTwo.js',
        name: 'ComponentTwo',
      });

      const result = await generateDocs([bundle1, bundle2])();

      assertEither(result, (data) => {
        expect(data.docs).toHaveLength(2);
        data.docs.forEach((doc) => {
          expect(doc.outputDocPath).toContain('lightning-web-components');
        });
      });
    });
  });

  describe('LWC with different targets and configurations', () => {
    it('handles LWC with multiple targets', async () => {
      const lwcBuilder = new LwcBuilder()
        .withName('CommunityComponent')
        .withDescription('Component for Experience Cloud')
        .withTargets(['lightningCommunity__Default', 'lightningCommunity__Page'])
        .withProperty({
          name: 'title',
          type: 'String',
          required: true,
          label: 'Title',
          description: 'The component title',
        });

      const lwcBundle = unparsedLwcBundleFromRawString({
        jsContent: lwcBuilder.buildJs(),
        xmlContent: lwcBuilder.buildMetaXml(),
        filePath: 'force-app/main/default/lwc/communityComponent/communityComponent.js',
        name: 'CommunityComponent',
      });

      const result = await generateDocs([lwcBundle])();

      assertEither(result, (data) => {
        expect(data.docs).toHaveLength(1);
        expect(data).firstDocContains('CommunityComponent (LWC)');
      });
    });

    it('handles LWC that is not exposed', async () => {
      const lwcBuilder = new LwcBuilder()
        .withName('InternalComponent')
        .withDescription('Internal utility component')
        .withIsExposed(false);

      const lwcBundle = unparsedLwcBundleFromRawString({
        jsContent: lwcBuilder.buildJs(),
        xmlContent: lwcBuilder.buildMetaXml(),
        filePath: 'force-app/main/default/lwc/internalComponent/internalComponent.js',
        name: 'InternalComponent',
      });

      const result = await generateDocs([lwcBundle])();

      assertEither(result, (data) => {
        expect(data.docs).toHaveLength(1);
        expect(data.docs[0].source.name).toBe('InternalComponent');
      });
    });
  });

  describe('edge cases and error handling', () => {
    it('handles empty LWC list', async () => {
      const result = await generateDocs([])();

      assertEither(result, (data) => {
        expect(data.docs).toHaveLength(0);
      });
    });

    it('handles LWC with minimal metadata', async () => {
      const minimalXml = `<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>60.0</apiVersion>
    <isExposed>false</isExposed>
</LightningComponentBundle>`;

      const minimalJs = `import { LightningElement } from 'lwc';
export default class MinimalComponent extends LightningElement {}`;

      const lwcBundle = unparsedLwcBundleFromRawString({
        jsContent: minimalJs,
        xmlContent: minimalXml,
        filePath: 'force-app/main/default/lwc/minimalComponent/minimalComponent.js',
        name: 'MinimalComponent',
      });

      const result = await generateDocs([lwcBundle])();

      assertEither(result, (data) => {
        expect(data.docs).toHaveLength(1);
        expect(data.docs[0].source.name).toBe('MinimalComponent');
        expect(data.docs[0].source.type).toBe('lwc');
      });
    });
  });
});
