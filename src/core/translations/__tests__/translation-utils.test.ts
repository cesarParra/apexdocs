import { mergeTranslations, validateUserTranslations } from '../translation-utils';
import { defaultTranslations } from '../default-translations';

describe('translation-utils', () => {
  describe('mergeTranslations', () => {
    it('should return default translations when no user translations provided', () => {
      const result = mergeTranslations();
      expect(result).toEqual(defaultTranslations);
    });

    it('should return default translations when undefined is provided', () => {
      const result = mergeTranslations(undefined);
      expect(result).toEqual(defaultTranslations);
    });

    it('should merge partial user translations with defaults', () => {
      const userTranslations = {
        markdown: {
          sections: {
            methods: 'Functions',
          },
        },
      };

      const result = mergeTranslations(userTranslations);

      expect(result.markdown.sections.methods).toBe('Functions');
      expect(result.markdown.sections.properties).toBe('Properties'); // Should keep default
      expect(result.changelog.title).toBe('Changelog'); // Should keep default
    });

    it('should completely override sections when provided', () => {
      const userTranslations = {
        changelog: {
          title: 'Change History',
          newClasses: {
            heading: 'Added Classes',
            description: 'These are the new classes.',
          },
        },
      };

      const result = mergeTranslations(userTranslations);

      expect(result.changelog.title).toBe('Change History');
      expect(result.changelog.newClasses.heading).toBe('Added Classes');
      expect(result.changelog.newClasses.description).toBe('These are the new classes.');
      // Should keep other defaults
      expect(result.changelog.newInterfaces.heading).toBe('New Interfaces');
    });

    it('should handle deep nested overrides', () => {
      const userTranslations = {
        markdown: {
          details: {
            parameters: 'Input Parameters',
            returnType: 'Output Type',
          },
          triggerEvents: {
            beforeInsert: 'Antes de Insertar',
          },
        },
      };

      const result = mergeTranslations(userTranslations);

      expect(result.markdown.details.parameters).toBe('Input Parameters');
      expect(result.markdown.details.returnType).toBe('Output Type');
      expect(result.markdown.details.type).toBe('Type'); // Should keep default
      expect(result.markdown.triggerEvents.beforeInsert).toBe('Antes de Insertar');
      expect(result.markdown.triggerEvents.beforeUpdate).toBe('Before Update'); // Should keep default
    });

    it('should handle complete translation replacement', () => {
      const userTranslations = {
        changelog: {
          title: 'Registro de Cambios',
          newClasses: {
            heading: 'Nuevas Clases',
            description: 'Estas clases son nuevas.',
          },
          newInterfaces: {
            heading: 'Nuevas Interfaces',
            description: 'Estas interfaces son nuevas.',
          },
          newEnums: {
            heading: 'Nuevos Enums',
            description: 'Estos enums son nuevos.',
          },
          newCustomObjects: {
            heading: 'Nuevos Objetos Personalizados',
            description: 'Estos objetos personalizados son nuevos.',
          },
          newTriggers: {
            heading: 'Nuevos Disparadores',
            description: 'Estos disparadores son nuevos.',
          },
          removedTypes: {
            heading: 'Tipos Eliminados',
            description: 'Estos tipos han sido eliminados.',
          },
          removedCustomObjects: {
            heading: 'Objetos Personalizados Eliminados',
            description: 'Estos objetos personalizados han sido eliminados.',
          },
          removedTriggers: {
            heading: 'Disparadores Eliminados',
            description: 'Estos disparadores han sido eliminados.',
          },
          newOrModifiedMembers: {
            heading: 'Miembros Nuevos o Modificados en Tipos Existentes',
            description: 'Estos miembros han sido agregados o modificados.',
          },
          newOrRemovedCustomFields: {
            heading: 'Campos Nuevos o Eliminados en Objetos Personalizados',
            description: 'Estos campos personalizados han sido agregados o eliminados.',
          },
          newOrRemovedCustomMetadataTypeRecords: {
            heading: 'Registros de Tipos de Metadatos Personalizados Nuevos o Eliminados',
            description: 'Estos registros de tipos de metadatos personalizados han sido agregados o eliminados.',
          },
          memberModifications: {
            newEnumValue: 'Nuevo Valor de Enum',
            removedEnumValue: 'Valor de Enum Eliminado',
            newMethod: 'Nuevo Método',
            removedMethod: 'Método Eliminado',
            newProperty: 'Nueva Propiedad',
            removedProperty: 'Propiedad Eliminada',
            newField: 'Nuevo Campo',
            removedField: 'Campo Eliminado',
            newType: 'Nuevo Tipo',
            removedType: 'Tipo Eliminado',
            newCustomMetadataRecord: 'Nuevo Registro de Metadatos Personalizados',
            removedCustomMetadataRecord: 'Registro de Metadatos Personalizados Eliminado',
            newTrigger: 'Nuevo Disparador',
            removedTrigger: 'Disparador Eliminado',
          },
        },
        markdown: {
          sections: {
            methods: 'Métodos',
            properties: 'Propiedades',
            fields: 'Campos',
            constructors: 'Constructores',
            values: 'Valores',
            classes: 'Clases',
            enums: 'Enums',
            interfaces: 'Interfaces',
            namespace: 'Espacio de Nombres',
            records: 'Registros',
            publishBehavior: 'Comportamiento de Publicación',
          },
          details: {
            type: 'Tipo',
            signature: 'Firma',
            group: 'Grupo',
            author: 'Autor',
            date: 'Fecha',
            see: 'Ver',
            possibleValues: 'Los valores posibles son',
            parameters: 'Parámetros',
            throws: 'Lanza',
            returnType: 'Tipo de Retorno',
            apiName: 'Nombre de API',
            required: 'Requerido',
            inlineHelpText: 'Texto de Ayuda en Línea',
            complianceGroup: 'Grupo de Cumplimiento',
            securityClassification: 'Clasificación de Seguridad',
            protected: 'Protegido',
          },
          typeSuffixes: {
            class: 'Clase',
            interface: 'Interfaz',
            enum: 'Enum',
            trigger: 'Disparador',
          },
          triggerEvents: {
            beforeInsert: 'Antes de Insertar',
            beforeUpdate: 'Antes de Actualizar',
            beforeDelete: 'Antes de Eliminar',
            afterInsert: 'Después de Insertar',
            afterUpdate: 'Después de Actualizar',
            afterDelete: 'Después de Eliminar',
            afterUndelete: 'Después de Recuperar',
          },
          publishBehaviors: {
            publishImmediately: 'Publicar Inmediatamente',
            publishAfterCommit: 'Publicar Después del Commit',
          },
          inheritance: {
            inheritance: 'Herencia',
            implements: 'Implementa',
          },
        },
      };

      const result = mergeTranslations(userTranslations);

      expect(result.changelog.title).toBe('Registro de Cambios');
      expect(result.markdown.sections.methods).toBe('Métodos');
      expect(result.markdown.triggerEvents.beforeInsert).toBe('Antes de Insertar');
    });
  });

  describe('validateUserTranslations', () => {
    it('should return true for undefined', () => {
      expect(validateUserTranslations(undefined)).toBe(true);
    });

    it('should return true for null', () => {
      expect(validateUserTranslations(null)).toBe(true);
    });

    it('should return true for valid translation object', () => {
      const validTranslations = {
        changelog: {
          title: 'Change History',
        },
        markdown: {
          sections: {
            methods: 'Functions',
          },
        },
      };

      expect(validateUserTranslations(validTranslations)).toBe(true);
    });

    it('should return false for invalid top-level keys', () => {
      const invalidTranslations = {
        invalidKey: {
          title: 'Test',
        },
      };

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const result = validateUserTranslations(invalidTranslations);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid translation key: invalidKey. Valid keys are: changelog, markdown'
      );

      consoleSpy.mockRestore();
    });

    it('should return true for partial valid translations', () => {
      const partialTranslations = {
        markdown: {
          sections: {
            methods: 'Functions',
          },
        },
      };

      expect(validateUserTranslations(partialTranslations)).toBe(true);
    });

    it('should return true for string values', () => {
      expect(validateUserTranslations('not an object')).toBe(true);
    });

    it('should return true for number values', () => {
      expect(validateUserTranslations(123)).toBe(true);
    });
  });
});
