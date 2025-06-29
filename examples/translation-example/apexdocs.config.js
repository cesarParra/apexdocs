import { defineMarkdownConfig, defineChangelogConfig } from '../../src/index.js';

// Example of using custom translations in different languages

// Spanish translations example
const spanishTranslations = {
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
    removedTypes: {
      heading: 'Tipos Eliminados',
      description: 'Estos tipos han sido eliminados.',
    },
    memberModifications: {
      newMethod: 'Nuevo Método',
      removedMethod: 'Método Eliminado',
      newProperty: 'Nueva Propiedad',
      removedProperty: 'Propiedad Eliminada',
    },
  },
  markdown: {
    sections: {
      methods: 'Métodos',
      properties: 'Propiedades',
      fields: 'Campos',
      constructors: 'Constructores',
      namespace: 'Espacio de Nombres',
    },
    details: {
      type: 'Tipo',
      signature: 'Firma',
      parameters: 'Parámetros',
      returnType: 'Tipo de Retorno',
      throws: 'Lanza',
    },
    typeSuffixes: {
      class: 'Clase',
      interface: 'Interfaz',
      enum: 'Enum',
      trigger: 'Disparador',
    },
  },
};

// Custom business terminology example (English but with different terms)
const businessTerminology = {
  markdown: {
    sections: {
      methods: 'Business Operations',
      properties: 'Business Attributes',
      fields: 'Data Elements',
      constructors: 'Initializers',
    },
    details: {
      parameters: 'Input Parameters',
      returnType: 'Output Type',
    },
    typeSuffixes: {
      class: 'Service',
      interface: 'Contract',
    },
  },
};

// Partial translations example - only override specific terms
const partialTranslations = {
  changelog: {
    title: 'Change History', // Only override the title
  },
  markdown: {
    sections: {
      methods: 'Functions', // Use "Functions" instead of "Methods"
    },
  },
};

export default {
  // Example 1: Spanish documentation
  spanish: defineMarkdownConfig({
    sourceDir: 'src',
    targetDir: 'docs-es',
    scope: ['public', 'global'],
    translations: spanishTranslations,
  }),

  // Example 2: Custom business terminology
  business: defineMarkdownConfig({
    sourceDir: 'src',
    targetDir: 'docs-business',
    scope: ['public', 'global'],
    translations: businessTerminology,
  }),

  // Example 3: Partial translations (most text remains in English)
  partial: defineMarkdownConfig({
    sourceDir: 'src',
    targetDir: 'docs-partial',
    scope: ['public', 'global'],
    translations: partialTranslations,
  }),

  // Example 4: Changelog with Spanish translations
  changelogSpanish: defineChangelogConfig({
    previousVersionDir: 'previous',
    currentVersionDir: 'current',
    targetDir: 'changelog-es',
    fileName: 'CAMBIOS',
    scope: ['public', 'global'],
    translations: spanishTranslations,
  }),

  // Example 5: No translations (uses defaults)
  default: defineMarkdownConfig({
    sourceDir: 'src',
    targetDir: 'docs-default',
    scope: ['public', 'global'],
    // No translations property - will use English defaults
  }),
};
