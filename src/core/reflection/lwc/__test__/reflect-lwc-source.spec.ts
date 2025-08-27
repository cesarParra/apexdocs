import { UnparsedLightningComponentBundle } from 'src/core/shared/types';
import { assertEither } from '../../../test-helpers/assert-either';
import { LwcBuilder } from '../../../test-helpers/test-data-builders/lwc-builder';
import { reflectLwcSource } from '../reflect-lwc-source';
import { isInSource } from '../../../shared/utils';

describe('when parsing LWC components', () => {
  test('the resulting type contains the file path', async () => {
    const lwcBuilder = new LwcBuilder().withName('TestComponent');
    const unparsed: UnparsedLightningComponentBundle = {
      type: 'lwc',
      name: 'TestComponent',
      filePath: 'force-app/main/default/lwc/testComponent/testComponent.js',
      content: lwcBuilder.buildJs(),
      metadataContent: lwcBuilder.buildMetaXml(),
    };

    const result = await reflectLwcSource([unparsed])();

    assertEither(result, (data) => {
      if (isInSource(data[0].source)) {
        expect(data[0].source.filePath).toBe('force-app/main/default/lwc/testComponent/testComponent.js');
      } else {
        fail('Expected the source to be in the source');
      }
    });
  });

  test('the resulting type contains the correct name', async () => {
    const lwcBuilder = new LwcBuilder().withName('MyAwesomeComponent');
    const unparsed: UnparsedLightningComponentBundle = {
      type: 'lwc',
      name: 'MyAwesomeComponent',
      filePath: 'force-app/main/default/lwc/myAwesomeComponent/myAwesomeComponent.js',
      content: lwcBuilder.buildJs(),
      metadataContent: lwcBuilder.buildMetaXml(),
    };

    const result = await reflectLwcSource([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.name).toBe('MyAwesomeComponent');
    });
  });

  test('the resulting type has the correct type_name', async () => {
    const lwcBuilder = new LwcBuilder().withName('TestComponent');
    const unparsed: UnparsedLightningComponentBundle = {
      type: 'lwc',
      name: 'TestComponent',
      filePath: 'force-app/main/default/lwc/testComponent/testComponent.js',
      content: lwcBuilder.buildJs(),
      metadataContent: lwcBuilder.buildMetaXml(),
    };

    const result = await reflectLwcSource([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.type_name).toBe('lwc');
    });
  });

  test('the description is extracted from metadata', async () => {
    const lwcBuilder = new LwcBuilder().withName('TestComponent').withDescription('This is a test component');
    const unparsed: UnparsedLightningComponentBundle = {
      type: 'lwc',
      name: 'TestComponent',
      filePath: 'force-app/main/default/lwc/testComponent/testComponent.js',
      content: lwcBuilder.buildJs(),
      metadataContent: lwcBuilder.buildMetaXml(),
    };

    const result = await reflectLwcSource([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.description).toBe('This is a test component');
    });
  });

  test('can process multiple LWC components', async () => {
    const component1Builder = new LwcBuilder().withName('ComponentOne');
    const component2Builder = new LwcBuilder().withName('ComponentTwo');

    const unparsed1: UnparsedLightningComponentBundle = {
      type: 'lwc',
      name: 'ComponentOne',
      filePath: 'force-app/main/default/lwc/componentOne/componentOne.js',
      content: component1Builder.buildJs(),
      metadataContent: component1Builder.buildMetaXml(),
    };

    const unparsed2: UnparsedLightningComponentBundle = {
      type: 'lwc',
      name: 'ComponentTwo',
      filePath: 'force-app/main/default/lwc/componentTwo/componentTwo.js',
      content: component2Builder.buildJs(),
      metadataContent: component2Builder.buildMetaXml(),
    };

    const result = await reflectLwcSource([unparsed1, unparsed2])();

    assertEither(result, (data) => {
      expect(data).toHaveLength(2);
      expect(data[0].type.name).toBe('ComponentOne');
      expect(data[1].type.name).toBe('ComponentTwo');
    });
  });

  test('processes component with complex JS content correctly', async () => {
    const complexJsContent = `import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

/**
 * @description A complex LWC component with various features
 */
export default class ComplexComponent extends LightningElement {
    @api recordId;
    @api variant = 'neutral';
    @api size = 'medium';

    /**
     * @description Handle click event
     */
    handleClick() {
        this.dispatchEvent(new CustomEvent('click'));
    }

    /**
     * @description Computed property for CSS classes
     */
    get cssClasses() {
        return \`slds-button slds-button_\${this.variant} slds-button_\${this.size}\`;
    }
}`;

    const lwcBuilder = new LwcBuilder().withName('ComplexComponent').withJsContent(complexJsContent);

    const unparsed: UnparsedLightningComponentBundle = {
      type: 'lwc',
      name: 'ComplexComponent',
      filePath: 'force-app/main/default/lwc/complexComponent/complexComponent.js',
      content: complexJsContent,
      metadataContent: lwcBuilder.buildMetaXml(),
    };

    const result = await reflectLwcSource([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.name).toBe('ComplexComponent');
      expect(data[0].type.type_name).toBe('lwc');
      if (isInSource(data[0].source)) {
        expect(data[0].source.filePath).toBe('force-app/main/default/lwc/complexComponent/complexComponent.js');
      }
    });
  });

  test('processes empty LWC list correctly', async () => {
    const result = await reflectLwcSource([])();

    assertEither(result, (data) => {
      expect(data).toHaveLength(0);
    });
  });

  test('the source type is lwc', async () => {
    const lwcBuilder = new LwcBuilder().withName('TestComponent');
    const unparsed: UnparsedLightningComponentBundle = {
      type: 'lwc',
      name: 'TestComponent',
      filePath: 'force-app/main/default/lwc/testComponent/testComponent.js',
      content: lwcBuilder.buildJs(),
      metadataContent: lwcBuilder.buildMetaXml(),
    };

    const result = await reflectLwcSource([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].source.type).toBe('lwc');
    });
  });

  test('the source name matches the component name', async () => {
    const lwcBuilder = new LwcBuilder().withName('DataTableComponent');
    const unparsed: UnparsedLightningComponentBundle = {
      type: 'lwc',
      name: 'DataTableComponent',
      filePath: 'force-app/main/default/lwc/dataTableComponent/dataTableComponent.js',
      content: lwcBuilder.buildJs(),
      metadataContent: lwcBuilder.buildMetaXml(),
    };

    const result = await reflectLwcSource([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].source.name).toBe('DataTableComponent');
    });
  });

  test('the isExposed flag is extracted from metadata', async () => {
    const lwcBuilder = new LwcBuilder().withName('TestComponent').withIsExposed(false);
    const unparsed: UnparsedLightningComponentBundle = {
      type: 'lwc',
      name: 'TestComponent',
      filePath: 'force-app/main/default/lwc/testComponent/testComponent.js',
      content: lwcBuilder.buildJs(),
      metadataContent: lwcBuilder.buildMetaXml(),
    };

    const result = await reflectLwcSource([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.isExposed).toBe(false);
    });
  });

  test('the masterLabel is extracted from metadata', async () => {
    const lwcBuilder = new LwcBuilder().withName('TestComponent').withMasterLabel('Custom Label');
    const unparsed: UnparsedLightningComponentBundle = {
      type: 'lwc',
      name: 'TestComponent',
      filePath: 'force-app/main/default/lwc/testComponent/testComponent.js',
      content: lwcBuilder.buildJs(),
      metadataContent: lwcBuilder.buildMetaXml(),
    };

    const result = await reflectLwcSource([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.masterLabel).toBe('Custom Label');
    });
  });

  test('targets are extracted from metadata', async () => {
    const lwcBuilder = new LwcBuilder()
      .withName('TestComponent')
      .withTargets(['lightningCommunity__Default', 'lightning__RecordPage']);
    const unparsed: UnparsedLightningComponentBundle = {
      type: 'lwc',
      name: 'TestComponent',
      filePath: 'force-app/main/default/lwc/testComponent/testComponent.js',
      content: lwcBuilder.buildJs(),
      metadataContent: lwcBuilder.buildMetaXml(),
    };

    const result = await reflectLwcSource([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.targets?.target).toEqual(['lightningCommunity__Default', 'lightning__RecordPage']);
    });
  });

  test('targetConfigs with properties are extracted from metadata', async () => {
    const lwcBuilder = new LwcBuilder().withName('TestComponent').withProperty({
      name: 'recordId',
      type: 'String',
      required: true,
      label: 'Record ID',
      description: 'The ID of the record to display',
    });
    const unparsed: UnparsedLightningComponentBundle = {
      type: 'lwc',
      name: 'TestComponent',
      filePath: 'force-app/main/default/lwc/testComponent/testComponent.js',
      content: lwcBuilder.buildJs(),
      metadataContent: lwcBuilder.buildMetaXml(),
    };

    const result = await reflectLwcSource([unparsed])();

    assertEither(result, (data) => {
      expect(data[0].type.targetConfigs?.targetConfig).toBeDefined();
      expect(data[0].type.targetConfigs?.targetConfig[0].property).toHaveLength(1);
      expect(data[0].type.targetConfigs?.targetConfig[0].property[0]['@_name']).toBe('recordId');
      expect(data[0].type.targetConfigs?.targetConfig[0].property[0]['@_type']).toBe('String');
      expect(data[0].type.targetConfigs?.targetConfig[0].property[0]['@_required']).toBe(true);
      expect(data[0].type.targetConfigs?.targetConfig[0].property[0]['@_label']).toBe('Record ID');
      expect(data[0].type.targetConfigs?.targetConfig[0].property[0]['@_description']).toBe(
        'The ID of the record to display',
      );
    });
  });
});
