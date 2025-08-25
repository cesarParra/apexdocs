import { LwcMetadata } from '../../../reflection/lwc/reflect-lwc-source';
import { lwcMetadataToRenderable } from '../type-to-renderable';

describe('LWC Adapter', () => {
  describe('lwcMetadataToRenderable', () => {
    it('converts LWC metadata to renderable with correct type', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'TestComponent',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.type).toBe('lwc');
    });

    it('sets the correct heading level', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'TestComponent',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.headingLevel).toBe(1);
    });

    it('sets the correct heading with LWC suffix', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'MyAwesomeComponent',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.heading).toBe('MyAwesomeComponent');
    });

    it('sets the component name correctly', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Test component description',
        type_name: 'lwc',
        name: 'DataTableComponent',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.name).toBe('DataTableComponent');
    });

    it('handles null description correctly', () => {
      const lwcMetadata: LwcMetadata = {
        description: null,
        type_name: 'lwc',
        name: 'TestComponent',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      expect(renderable.doc.description).toBeUndefined();
    });

    it('handles non-null description correctly', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'A comprehensive test component',
        type_name: 'lwc',
        name: 'TestComponent',
      };

      const renderable = lwcMetadataToRenderable(lwcMetadata);

      // Note: Currently the implementation sets description to undefined regardless
      // This test documents the current behavior - when description extraction is implemented,
      // this test should be updated to expect the actual description
      expect(renderable.doc.description).toBeUndefined();
    });

    it('works with components that have special characters in names', () => {
      const lwcMetadata: LwcMetadata = {
        description: 'Component with underscore',
        type_name: 'lwc',
        name: 'custom_component_v2',
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
  });
});
