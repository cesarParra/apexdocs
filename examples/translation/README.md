# Sample Project With Provided Translations

Demonstrates how to provide translations to ApexDocs to customize the language and terminology used in generated documentation.

## Overview

The translation feature allows you to:

1. **Translate documentation to different languages** (Spanish, French, etc.)
2. **Use custom business terminology** (e.g., "Business Operations" instead of "Methods")
3. **Partially override specific terms** while keeping the rest in English

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

## Notes

- Only the **markdown** and **changelog** generators support translations
- All translations are optional - anything not specified uses the English default
