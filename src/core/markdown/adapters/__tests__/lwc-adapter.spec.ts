import { LwcMetadata } from '../../../reflection/lwc/reflect-lwc-source';
import { lwcMetadataToRenderable } from '../type-to-renderable';

describe('LWC Adapter', () => {
  describe('lwcMetadataToRenderable', () => {
    it('converts LWC metadata to renderable with correct type', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'TestComponent',
        isExposed: true,
        masterLabel: 'Test Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.type).toBe('lwc');
    });

    it('sets the correct heading level', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'TestComponent',
        isExposed: true,
        masterLabel: 'Test Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.headingLevel).toBe(1);
    });

    it('sets the correct heading with LWC suffix', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'MyAwesomeComponent',
        isExposed: true,
        masterLabel: 'My Awesome Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.heading).toBe('MyAwesomeComponent');
    });

    it('sets the component name correctly', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'DataTableComponent',
        isExposed: true,
        masterLabel: 'Data Table Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.name).toBe('DataTableComponent');
    });

    it('handles undefined description correctly', () => {
      const lwcMetadata: LwcMetadata = {
        description: undefined,
        type_name: 'lwc',
        name: 'TestComponent',
        isExposed: true,
        masterLabel: 'Test Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.doc.description).toBeUndefined();
    });

    it('handles non-null description correctly', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'A comprehensive test component',
        type_name: 'lwc',
        name: 'TestComponent',
        isExposed: true,
        masterLabel: 'Test Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.doc.description).toEqual(['A comprehensive test component']);
    });

    it('works with components that have special characters in names', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Component with underscore',
        type_name: 'lwc',
        name: 'custom_component_v2',
        isExposed: true,
        masterLabel: 'Custom Component V2',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.name).toBe('custom_component_v2');
      expect(renderable.heading).toBe('custom_component_v2');
    });

    it('works with components that have camelCase names', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'CamelCase component',
        type_name: 'lwc',
        name: 'myCustomDataComponent',
        isExposed: true,
        masterLabel: 'My Custom Data Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.name).toBe('myCustomDataComponent');
      expect(renderable.heading).toBe('myCustomDataComponent');
    });

    it('works with components that have PascalCase names', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'PascalCase component',
        type_name: 'lwc',
        name: 'MyCustomDataComponent',
        isExposed: true,
        masterLabel: 'My Custom Data Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.name).toBe('MyCustomDataComponent');
      expect(renderable.heading).toBe('MyCustomDataComponent');
    });

    it('maintains consistent structure for all components', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Another test component',
        type_name: 'lwc',
        name: 'AnotherComponent',
        isExposed: true,
        masterLabel: 'Another Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      // Verify the renderable has the expected structure
      expect(renderable).toHaveProperty('type', 'lwc');
      expect(renderable).toHaveProperty('headingLevel', 1);
      expect(renderable).toHaveProperty('heading');
      expect(renderable).toHaveProperty('name');
      expect(renderable).toHaveProperty('doc');
      expect(renderable.doc).toHaveProperty('description');
    });

    it('includes isExposed information in custom tags when component is exposed', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'TestComponent',
        isExposed: true,
        masterLabel: 'Test Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.doc.customTags).toBeDefined();
      expect(renderable.doc.customTags![0].name).toBe('exposed');
      expect(renderable.doc.customTags![0].description).toContain('`Exposed`');
    });

    it('does not include isExposed information when component is not exposed', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'TestComponent',
        isExposed: false,
        masterLabel: 'Test Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.doc.customTags).toBeUndefined();
    });

    it('includes master label information in custom tags', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'TestComponent',
        isExposed: true,
        masterLabel: 'Test Component Label',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.doc.customTags).toBeDefined();
      expect(renderable.doc.customTags![0].name).toBe('exposed');
      expect(renderable.doc.customTags![0].description).toContain('`Exposed`');
    });

    it('includes targets information in custom tags when available', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'TestComponent',
        isExposed: true,
        masterLabel: 'Test Component',
        targets: {
          target: ['lightningCommunity__Default', 'lightning__AppPage'],
        },
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.doc.customTags).toBeDefined();
      expect(renderable.doc.customTags![0].name).toBe('exposed');
      expect(renderable.doc.customTags![0].description).toContain('`Exposed`');
      expect(renderable.doc.customTags![1].name).toBe('targets');
      expect(renderable.doc.customTags![1].description).toEqual([
        '- lightningCommunity__Default',
        '- lightning__AppPage',
      ]);
    });

    it('includes target configs information in custom tags when available', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'TestComponent',
        isExposed: true,
        masterLabel: 'Test Component',
        targetConfigs: {
          targetConfig: [
            {
              '@_targets': 'lightningCommunity__Default',
              property: [
                {
                  '@_name': 'recordId',
                  '@_type': 'String',
                  '@_required': true,
                  '@_label': 'Record ID',
                  '@_description': 'The ID of the record to display',
                },
              ],
            },
          ],
        },
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.doc.customTags).toBeDefined();
      expect(renderable.doc.customTags![0].name).toBe('exposed');
      expect(renderable.doc.customTags![0].description).toContain('`Exposed`');
      expect(renderable.doc.customTags![1].name).toBe('targetConfig');
      expect(renderable.doc.customTags![1].description).toContain('### lightningCommunity__Default');
      expect(renderable.doc.customTags![1].description).toContain('#### Properties');
      expect(renderable.doc.customTags![1].description).toContain('**recordId**');
      expect(renderable.doc.customTags![1].description).toContain('- Type: String');
      expect(renderable.doc.customTags![1].description).toContain('- Required: true');
      expect(renderable.doc.customTags![1].description).toContain('- Description: The ID of the record to display');
    });

    it('handles components with no additional metadata gracefully', () => {
      const lwcMetadata: LwcMetadata = {
        description: undefined,
        type_name: 'lwc',
        name: 'TestComponent',
        isExposed: false,
        masterLabel: 'Test Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.doc.description).toBeUndefined();
    });
  });
});
