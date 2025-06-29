# Sample Project With Provided Translations

Demonstrates how to provide translations to ApexDocs to customize the language and terminology used in generated documentation.

## Overview

The translation feature allows you to:

1. **Translate documentation to different languages** (Spanish, French, etc.)
2. **Use custom business terminology** (e.g., "Business Operations" instead of "Methods")
3. **Partially override specific terms** while keeping the rest in English
4. **Maintain consistency** across your organization's documentation standards

## How It Works

ApexDocs uses a translation system with:

- **Default English translations** built into the system
- **User-provided overrides** that can be partial or complete
- **Deep merging** so you only need to specify what you want to change

## Configuration

Add a `translations` property to your ApexDocs configuration:

```javascript
import { defineMarkdownConfig } from '@cparra/apexdocs';

export default defineMarkdownConfig({
  sourceDir: 'src',
  targetDir: 'docs',
  scope: ['public', 'global'],
  translations: {
    // Your custom translations here
    markdown: {
      sections: {
        methods: 'Métodos',
        properties: 'Propiedades',
        fields: 'Campos',
      },
    },
  },
});
```

## Translation Structure

The translation object has two main sections:

### Changelog Translations

```javascript
{
  changelog: {
    title: 'Changelog',
    newClasses: {
      heading: 'New Classes',
      description: 'These classes are new.',
    },
    newInterfaces: {
      heading: 'New Interfaces',
      description: 'These interfaces are new.',
    },
    // ... more changelog sections
    memberModifications: {
      newMethod: 'New Method',
      removedMethod: 'Removed Method',
      // ... more modification types
    },
  }
}
```

### Markdown Documentation Translations

```javascript
{
  markdown: {
    sections: {
      methods: 'Methods',
      properties: 'Properties',
      fields: 'Fields',
      constructors: 'Constructors',
      values: 'Values',           // for enums
      classes: 'Classes',         // for inner classes
      enums: 'Enums',            // for inner enums
      interfaces: 'Interfaces',   // for inner interfaces
      namespace: 'Namespace',
      records: 'Records',         // for custom metadata
      publishBehavior: 'Publish Behavior',
    },
    details: {
      type: 'Type',
      signature: 'Signature',
      group: 'Group',
      author: 'Author',
      date: 'Date',
      see: 'See',
      possibleValues: 'Possible values are',
      parameters: 'Parameters',
      throws: 'Throws',
      returnType: 'Return Type',
      apiName: 'API Name',
      required: 'Required',
      // ... more detail labels
    },
    typeSuffixes: {
      class: 'Class',
      interface: 'Interface',
      enum: 'Enum',
      trigger: 'Trigger',
    },
    triggerEvents: {
      beforeInsert: 'Before Insert',
      beforeUpdate: 'Before Update',
      // ... more trigger events
    },
    publishBehaviors: {
      publishImmediately: 'Publish Immediately',
      publishAfterCommit: 'Publish After Commit',
    },
    inheritance: {
      inheritance: 'Inheritance',
      implements: 'Implements',
    },
  }
}
```

## Examples

### Complete Spanish Translation

```javascript
const spanishTranslations = {
  changelog: {
    title: 'Registro de Cambios',
    newClasses: {
      heading: 'Nuevas Clases',
      description: 'Estas clases son nuevas.',
    },
    // ... more changelog translations
  },
  markdown: {
    sections: {
      methods: 'Métodos',
      properties: 'Propiedades',
      fields: 'Campos',
      constructors: 'Constructores',
    },
    details: {
      type: 'Tipo',
      signature: 'Firma',
      parameters: 'Parámetros',
    },
    typeSuffixes: {
      class: 'Clase',
      interface: 'Interfaz',
      enum: 'Enum',
    },
  },
};
```

### Custom Business Terminology

```javascript
const businessTerminology = {
  markdown: {
    sections: {
      methods: 'Business Operations',
      properties: 'Business Attributes',
      fields: 'Data Elements',
      constructors: 'Initializers',
    },
    typeSuffixes: {
      class: 'Service',
      interface: 'Contract',
    },
  },
};
```

### Partial Overrides

```javascript
const partialTranslations = {
  markdown: {
    sections: {
      methods: 'Functions', // Only change "Methods" to "Functions"
    },
  },
};
```

## Usage with Different Generators

### Markdown Generator

```javascript
export default defineMarkdownConfig({
  sourceDir: 'src',
  targetDir: 'docs',
  scope: ['public', 'global'],
  translations: yourTranslations,
});
```

### Changelog Generator

```javascript
export default defineChangelogConfig({
  previousVersionDir: 'previous',
  currentVersionDir: 'current',
  targetDir: 'changelog',
  fileName: 'CHANGELOG',
  scope: ['public', 'global'],
  translations: yourTranslations,
});
```

## Best Practices

1. **Start Small**: Begin with partial translations for the most important terms
2. **Be Consistent**: Use the same terminology across your organization
3. **Test Thoroughly**: Generate documentation with your translations to verify the output
4. **Document Your Choices**: Keep track of your translation decisions for future reference
5. **Version Control**: Include your translation configurations in version control

## TypeScript Support

If you're using TypeScript, you can import the translation types for better autocomplete and type safety:

```typescript
import { defineMarkdownConfig } from '@cparra/apexdocs';
import type { UserTranslations } from '@cparra/apexdocs';

const translations: UserTranslations = {
  markdown: {
    sections: {
      methods: 'Functions',
    },
  },
};

export default defineMarkdownConfig({
  sourceDir: 'src',
  targetDir: 'docs',
  scope: ['public', 'global'],
  translations,
});
```

## Validation

The translation system includes basic validation to catch common mistakes:

- Invalid top-level keys will generate warnings
- Missing translations fall back to English defaults
- Deep merging ensures you only need to specify what changes

## Notes

- Only the **markdown** and **changelog** generators support translations
- The **OpenAPI** generator does not use the translation system
- All translations are optional - anything not specified uses the English default
- The system uses deep merging, so partial translations work seamlessly
