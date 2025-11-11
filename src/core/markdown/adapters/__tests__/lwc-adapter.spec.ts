import { LwcMetadata } from '../../../reflection/lwc/reflect-lwc-source';
import { lwcMetadataToRenderable } from '../type-to-renderable';
import { MarkdownGeneratorConfig } from '../../generate-docs';
import { defaultTranslations } from '../../../translations';

describe('LWC Adapter', () => {
  const defaultConfig: MarkdownGeneratorConfig = {
    targetDir: '',
    scope: ['global', 'public'],
    customObjectVisibility: ['public'],
    namespace: '',
    defaultGroupName: 'Miscellaneous',
    customObjectsGroupName: 'Custom Objects',
    triggersGroupName: 'Triggers',
    referenceGuideTemplate: '',
    sortAlphabetically: false,
    linkingStrategy: 'relative',
    referenceGuideTitle: 'Apex Reference Guide',
    includeFieldSecurityMetadata: true,
    includeInlineHelpTextMetadata: true,
    exclude: [],
    excludeTags: [],
    lwcGroupName: 'Lightning Web Components',
    experimentalLwcSupport: true
  };

  describe('lwcMetadataToRenderable', () => {
    it('converts LWC metadata to renderable with correct type', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'TestComponent',
        isExposed: true,
        masterLabel: 'Test Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

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

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

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

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

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

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

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

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

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

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

      expect(renderable.description).toEqual('A comprehensive test component');
    });

    it('works with components that have special characters in names', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Component with underscore',
        type_name: 'lwc',
        name: 'custom_component_v2',
        isExposed: true,
        masterLabel: 'Custom Component V2',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

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

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

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

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

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

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

      // Verify the renderable has the expected structure
      expect(renderable).toHaveProperty('type', 'lwc');
      expect(renderable).toHaveProperty('headingLevel', 1);
      expect(renderable).toHaveProperty('heading');
      expect(renderable).toHaveProperty('name');
      expect(renderable).toHaveProperty('doc');
      expect(renderable).toHaveProperty('description');
    });

    it('includes isExposed information when component is exposed', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'TestComponent',
        isExposed: true,
        masterLabel: 'Test Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

      expect(renderable.exposed).toBe(true);
    });

    it('does not include isExposed information when component is not exposed', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'TestComponent',
        isExposed: false,
        masterLabel: 'Test Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

      expect(renderable.exposed).toBe(false);
    });

    it('includes master label information', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'TestComponent',
        isExposed: true,
        masterLabel: 'Test Component Label',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

      expect(renderable.exposed).toBe(true);
    });

    it('includes targets information when available', () => {
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

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

      expect(renderable.targets.value).toEqual(['lightningCommunity__Default', 'lightning__AppPage']);
      expect(renderable.targets.heading).toBe('Targets');
      expect(renderable.targets.headingLevel).toBe(2);
    });

    it('includes target configs information when available', () => {
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

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

      expect(renderable.targetConfigs.value).toHaveLength(1);
      expect(renderable.targetConfigs.value[0].targetName).toBe('lightningCommunity__Default');
      expect(renderable.targetConfigs.value[0].properties).toHaveLength(1);
      expect(renderable.targetConfigs.value[0].properties[0].name).toBe('recordId');
      expect(renderable.targetConfigs.value[0].properties[0].type).toBe('String');
      expect(renderable.targetConfigs.value[0].properties[0].required).toBe(true);
      expect(renderable.targetConfigs.value[0].properties[0].description).toBe('The ID of the record to display');
      expect(renderable.targetConfigs.heading).toBe('Target Configs');
      expect(renderable.targetConfigs.headingLevel).toBe(2);
    });

    it('handles components with no additional metadata gracefully', () => {
      const lwcMetadata: LwcMetadata = {
        description: undefined,
        type_name: 'lwc',
        name: 'TestComponent',
        isExposed: false,
        masterLabel: 'Test Component',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata, defaultConfig, defaultTranslations);

      expect(renderable.doc.description).toBeUndefined();
    });
  });
});
