# Custom Templates Example

This example demonstrates the custom template functionality in ApexDocs, which allows you to completely customize the output format of your generated documentation.

## 🎯 Overview

ApexDocs now supports custom templates for the markdown generator, giving you full control over:
- **Template format**: Use either string templates (Handlebars syntax) or function templates (JavaScript/TypeScript)
- **Per-type customization**: Define different templates for classes, interfaces, enums, triggers, LWC components, custom objects, and reference guides
- **Template helpers**: Access all built-in helpers as pure functions for consistent rendering

## 📁 What's Included

This example contains:

- **Sample Apex code**:
  - `MyClass.cls`: A comprehensive class with methods, properties, and inheritance
  - `BaseClass.cls`: A base class demonstrating inheritance features
  - `StatusEnum.cls`: An enumeration with methods and detailed documentation
  - `AccountTrigger.trigger`: A simple trigger example

- **Custom template configuration** (`apexdocs.config.ts`):
  - Function template for classes (TypeScript with full type safety)
  - String template for enums (Handlebars syntax)
  - String template for interfaces
  - Function template for triggers
  - Custom reference guide template

- **Build scripts** to generate documentation with custom templates

## 🚀 Getting Started

### Prerequisites

- Node.js and npm installed
- TypeScript installed globally or locally: `npm install -g typescript`

### Installation

1. Navigate to this directory:
   ```bash
   cd examples/markdown-custom-templates
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Generating Documentation

1. Clean previous documentation (optional):
   ```bash
   npm run docs:clean
   ```

2. Generate documentation with custom templates:
   ```bash
   npm run docs:gen
   ```

This will generate documentation in the `docs/` folder using the custom templates defined in `apexdocs.config.ts`.

## 🔧 Custom Template Configuration

The main configuration file (`apexdocs.config.ts`) demonstrates two approaches to custom templates:

### 1. Function Templates (TypeScript)

Function templates are JavaScript/TypeScript functions that receive the renderable object and a `TemplateHelpers` object:

```typescript
class: (renderable: RenderableClass, helpers: TemplateHelpers): string => {
  const { heading, renderContent, inlineCode } = helpers;
  
  let output = `${heading(1, renderable.name)}\n\n`;
  // ... build output dynamically
  return output;
}
```

**Advantages**:
- Full TypeScript type safety
- Complete control over logic and formatting
- Can use any JavaScript/TypeScript features
- Easy to test and debug

### 2. String Templates (Handlebars)

String templates use Handlebars syntax and are compiled at runtime:

```handlebars
# {{name}}

{{renderContent description}}

## Methods

{{#each methods}}
### {{name}}
{{renderContent description}}
{{/each}}
```

**Advantages**:
- Simpler syntax for straightforward templates
- Familiar to Handlebars users
- Can be stored externally (in files, databases, etc.)

## 🛠️ Available Template Helpers

Both string and function templates have access to the same rendering helpers:

| Helper | Description | Example |
|--------|-------------|---------|
| `link(source)` | Converts StringOrLink to markdown link | `link('text')` or `link({title: 'Link', url: '/path'})` |
| `code(codeBlock)` | Formats code blocks with language | `code({language: 'apex', content: ['System.debug();']})` |
| `renderContent(content)` | Renders RenderableContent array to markdown | `renderContent(description)` |
| `heading(level, text)` | Creates markdown headings | `heading(2, 'Methods')` → `## Methods` |
| `inlineCode(text)` | Formats inline code | `inlineCode('methodName')` → `` `methodName` `` |
| `splitAndCapitalize(text)` | Splits hyphen/underscore text and capitalizes | `splitAndCapitalize('my-class')` → `My Class` |
| `eq(a, b)` | Equality comparison | `{{#if (eq value 10)}}` |
| `add(a, b)` | Addition | `{{add index 1}}` |
| `lookup(array, index)` | Array element access | `lookup(items, 0)` |
| `parseJSON(jsonString)` | Parses JSON string | `parseJSON('{"key":"value"}')` |
| `startsWith(str, prefix)` | String prefix check | `startsWith(name, 'Test')` |
| `substring(str, start, length)` | Substring extraction | `substring(name, 0, 10)` |

## 📝 Template Types

You can define templates for any of these renderable types:

| Type | Template Key | Renderable Type |
|------|-------------|-----------------|
| Class | `class` | `RenderableClass` |
| Interface | `interface` | `RenderableInterface` |
| Enum | `enum` | `RenderableEnum` |
| Trigger | `trigger` | `RenderableTrigger` |
| LWC Component | `lwc` | `RenderableLwc` |
| Custom Object | `customObject` | `RenderableCustomObject` |
| Reference Guide | `referenceGuide` | `ReferenceGuideData` |

## 💡 Best Practices

### 1. **Start Simple**
Begin with string templates for straightforward formatting, then move to function templates for complex logic.

### 2. **Use TypeScript for Function Templates**
Import the renderable types for better autocomplete and type safety:
```typescript
import type { RenderableClass, TemplateHelpers } from '@cparra/apexdocs';
```

### 3. **Leverage Template Helpers**
Always use the provided helpers instead of manual string manipulation for consistent rendering.

### 4. **Combine with Hooks**
Custom templates work well with existing hooks:
```typescript
export default defineMarkdownConfig({
  templates: customTemplates,
  transformDocPage: (doc) => ({
    frontmatter: { title: doc.source.name }
  }),
});
```

### 5. **Handle Missing Data**
Check for optional properties before using them:
```typescript
if (renderable.description && renderable.description.length > 0) {
  output += renderContent(renderable.description);
}
```

## 🔄 Mixing Template Types

You can mix and match string and function templates for different renderable types:

```typescript
const mixedTemplates: TemplateConfig = {
  class: stringTemplateForClasses,     // String template
  enum: functionTemplateForEnums,      // Function template
  interface: anotherStringTemplate,    // String template
  trigger: anotherFunctionTemplate,    // Function template
};
```

## 🚫 Limitations

1. **Async Templates**: Function templates that return `Promise<string>` are supported but require async pipeline handling.

2. **Translation Support**: When using custom templates, translation support is not automatically applied. You must handle translations in your template if needed.

3. **Partial Templates**: You can define templates for only some renderable types; others will use the default templates.

## 📚 Additional Resources

- [ApexDocs Main Documentation](../../README.md)
- [Template Helpers Source](../../src/core/template-helpers.ts)
- [Type Definitions](../../src/core/shared/types.d.ts)

## 🏃 Running This Example

After generating documentation, check the `docs/` folder to see the custom-formatted output. Compare it with the default templates to see the differences in structure and formatting.

## 🆚 Comparison with Default Templates

Custom templates allow you to:
- Change the structure and organization of documentation
- Add or remove sections
- Customize formatting and styling
- Include additional metadata or examples
- Create completely different output formats

## 🤝 Contributing

Feel free to modify the templates in `apexdocs.config.ts` to experiment with different output formats. The example is designed to be a starting point for your own custom template implementations.

---
*This example demonstrates the power and flexibility of ApexDocs' custom template system.*