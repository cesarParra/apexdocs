import { defineMarkdownConfig, UserTranslations } from '../../src';

// Spanish translations
const spanishTranslations: UserTranslations = {
  markdown: {
    sections: {
      methods: 'Métodos',
      properties: 'Propiedades',
      fields: 'Campos',
      constructors: 'Constructores',
      namespace: 'Espacio de Nombres',
      values: 'Valores',
    },
    details: {
      apiName: 'Nombre API',
      type: 'Tipo',
      signature: 'Firma',
      parameters: 'Parámetros',
      returnType: 'Tipo de Retorno',
      throws: 'Lanza',
      required: 'Requerido',
      author: 'Autor',
    },
    typeSuffixes: {
      class: 'Clase',
      interface: 'Interfaz',
      enum: 'Enum',
      trigger: 'Disparador',
    },
    inheritance: {
      inheritance: 'Herencia',
      implements: 'Implementa',
    },
  },
};

export default {
  markdown: defineMarkdownConfig({
    sourceDir: 'force-app',
    scope: ['global', 'public'],
    translations: spanishTranslations,
  }),
};
