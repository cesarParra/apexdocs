import { defineMarkdownConfig, templateHelpers } from '@cparra/apexdocs';
import type {
  TemplateConfig,
  TemplateHelpers,
  RenderableClass,
  RenderableInterface,
  RenderableEnum,
  RenderableTrigger,
  RenderableLwc,
  RenderableCustomObject,
  ReferenceGuideData,
  ReferenceGuideReference,
} from '@cparra/apexdocs';

/**
 * Custom template configuration for ApexDocs markdown generation.
 * This example demonstrates both string templates (Handlebars) and function templates (JavaScript/TypeScript).
 */

const customTemplates: TemplateConfig = {
  /**
   * Function template for classes - demonstrates dynamic template generation with full TypeScript support
   */
  class: (renderable: RenderableClass, helpers: TemplateHelpers): string => {
    const { heading, renderContent, inlineCode, splitAndCapitalize } = helpers;

    let output = `${heading(1, renderable.name)}\n\n`;

    // Class metadata
    output += '## Class Information\n\n';
    output += `- **Type:** ${splitAndCapitalize(renderable.type)}\n`;
    output += `- **Access Modifier:** ${renderable.accessModifier || 'public'}\n`;

    if (renderable.extends) {
      output += `- **Extends:** ${renderable.extends.name}\n`;
    }

    if (renderable.implements && renderable.implements.length > 0) {
      output += `- **Implements:** ${renderable.implements.map(i => i.name).join(', ')}\n`;
    }

    output += `- **File:** ${renderable.filePath}\n\n`;

    // Annotations
    if (renderable.annotations.length > 0) {
      output += `${heading(2, 'Annotations')}\n\n`;
      renderable.annotations.forEach(annotation => {
        output += `- ${inlineCode(annotation.name)}`;
        if (annotation.value) output += `: ${annotation.value}`;
        output += '\n';
      });
      output += '\n';
    }

    // Description
    if (renderable.description && renderable.description.length > 0) {
      output += `${heading(2, 'Description')}\n\n`;
      output += `${renderContent(renderable.description)}\n\n`;
    }

    // Constructors
    if (renderable.constructors.length > 0) {
      output += `${heading(2, 'Constructors')}\n\n`;
      renderable.constructors.forEach(constructor => {
        output += `${heading(3, constructor.name)}`;

        if (constructor.accessModifier !== 'public') {
          output += ` (${constructor.accessModifier})`;
        }
        output += '\n\n';

        if (constructor.description && constructor.description.length > 0) {
          output += `${renderContent(constructor.description)}\n\n`;
        }

        if (constructor.parameters.length > 0) {
          output += `${heading(4, 'Parameters')}\n\n`;
          constructor.parameters.forEach(param => {
            output += `- ${inlineCode(param.name)}`;
            output += ` (${param.type.name})`;
            if (param.description && param.description.length > 0) {
              output += `: ${renderContent(param.description)}`;
            }
            output += '\n';
          });
          output += '\n';
        }
      });
    }

    // Properties
    if (renderable.properties.length > 0) {
      output += `${heading(2, 'Properties')}\n\n`;
      renderable.properties.forEach(property => {
        output += `${heading(3, property.name)}`;

        if (property.accessModifier !== 'public') {
          output += ` (${property.accessModifier})`;
        }
        output += '\n\n';

        if (property.description && property.description.length > 0) {
          output += `${renderContent(property.description)}\n\n`;
        }

        output += `- **Type:** ${property.type.name}\n`;
        if (property.defaultValue) {
          output += `- **Default:** ${inlineCode(property.defaultValue)}\n`;
        }
        output += '\n';
      });
    }

    // Methods
    if (renderable.methods.length > 0) {
      output += `${heading(2, 'Methods')}\n\n`;
      renderable.methods.forEach(method => {
        output += `${heading(3, method.name)}`;

        if (method.accessModifier !== 'public') {
          output += ` (${method.accessModifier})`;
        }
        if (method.modifiers && method.modifiers.length > 0) {
          output += ` [${method.modifiers.join(', ')}]`;
        }
        output += '\n\n';

        if (method.description && method.description.length > 0) {
          output += `${renderContent(method.description)}\n\n`;
        }

        if (method.parameters.length > 0) {
          output += `${heading(4, 'Parameters')}\n\n`;
          method.parameters.forEach(param => {
            output += `- ${inlineCode(param.name)}`;
            output += ` (${param.type.name})`;
            if (param.description && param.description.length > 0) {
              output += `: ${renderContent(param.description)}`;
            }
            output += '\n';
          });
          output += '\n';
        }

        if (method.returnType) {
          output += `${heading(4, 'Returns')}\n\n`;
          output += `- **Type:** ${method.returnType.type.name}\n`;
          if (method.returnType.description && method.returnType.description.length > 0) {
            output += `- **Description:** ${renderContent(method.returnType.description)}\n`;
          }
          output += '\n';
        }

        // Add separator between methods
        output += '---\n\n';
      });
    }

    // Example section
    output += `${heading(2, 'Examples')}\n\n`;
    output += '```apex\n';
    output += `// Example usage of ${renderable.name}\n`;
    output += `${renderable.name} instance = new ${renderable.name}();\n`;
    output += '// Add your example code here\n';
    output += '```\n';

    return output;
  },

  /**
   * String template for enums - demonstrates Handlebars syntax
   * String templates are simpler but have access to all the same helpers
   */
  enum: `# {{name}}

{{renderContent description}}

## Enum Values

{{#each values}}
### {{name}}
{{#if description}}
{{renderContent description}}
{{/if}}
{{/each}}

## Methods

{{#each methods}}
### {{name}}
{{renderContent description}}

{{#if parameters.length}}
#### Parameters
{{#each parameters}}
- **{{name}}** ({{type.name}}){{#if description}}: {{renderContent description}}{{/if}}
{{/each}}
{{/if}}

{{#if returnType}}
#### Returns
- **Type:** {{returnType.type.name}}
{{#if returnType.description}}
- **Description:** {{renderContent returnType.description}}
{{/if}}
{{/if}}
{{/each}}

---

*Generated with custom enum template*`,

  /**
   * String template for interfaces
   */
  interface: `# {{name}} Interface

{{renderContent description}}

## Interface Details
- **Type:** Interface
- **Access Modifier:** {{accessModifier}}

{{#if extends.length}}
## Extended Interfaces
{{#each extends}}
- {{name}}
{{/each}}
{{/if}}

## Methods

{{#each methods}}
### {{name}}
{{renderContent description}}

**Signature:** {{accessModifier}} {{name}}({{#each parameters}}{{type.name}} {{name}}{{#unless @last}}, {{/unless}}{{/each}}){{#if returnType}}: {{returnType.type.name}}{{/if}}

{{#if parameters.length}}
#### Parameters
{{#each parameters}}
- **{{name}}** ({{type.name}}){{#if description}}: {{renderContent description}}{{/if}}
{{/each}}
{{/if}}

{{/each}}

---

*Generated with custom interface template*`,

  /**
   * Simple function template for triggers
   */
  trigger: (renderable: RenderableTrigger, helpers: TemplateHelpers): string => {
    return `${helpers.heading(1, renderable.name)}\n\n` +
      `${helpers.renderContent(renderable.description)}\n\n` +
      `**Object:** ${renderable.object}\n\n` +
      `**Events:** ${renderable.events.join(', ')}\n\n` +
      `*Custom trigger template generated*`;
  },

  /**
   * Custom reference guide template
   */
  referenceGuide: (data: ReferenceGuideData, helpers: TemplateHelpers): string => {
    const { heading, renderContent } = helpers;

    let output = `${heading(1, data.referenceGuideTitle)}\n\n`;
    output += `> This reference guide was generated using a custom template\n\n`;

    // Count total references
    let totalCount = 0;
    Object.values(data.references).forEach(group => {
      totalCount += group.length;
    });

    output += `## Overview\n\n`;
    output += `- **Total Items:** ${totalCount}\n`;
    output += `- **Groups:** ${Object.keys(data.references).length}\n\n`;

    // Group references alphabetically
    const sortedGroups = Object.keys(data.references).sort();

    sortedGroups.forEach(groupName => {
      const groupItems = data.references[groupName];

      output += `${heading(2, groupName)}\n\n`;

      groupItems.forEach((item: ReferenceGuideReference) => {
        output += `- [${item.title}](${item.url})`;
        if (item.description && item.description.length > 0) {
          output += ` - ${renderContent(item.description)}`;
        }
        output += '\n';
      });

      output += '\n';
    });

    return output;
  },
};

/**
 * Main configuration using custom templates
 */
export default defineMarkdownConfig({
  sourceDir: 'force-app',
  targetDir: 'docs',
  scope: ['global', 'public', 'protected', 'private', 'namespaceaccessible'],
  sortAlphabetically: true,
  experimentalLwcSupport: false,
  referenceGuideTitle: 'API Reference - Custom Template Example',

  /**
   * Custom templates configuration
   * This overrides the default templates with our custom implementations
   */
  templates: customTemplates,

  /**
   * Optional: You can also mix custom templates with hooks
   * For example, adding frontmatter to all generated pages
   */
  transformDocPage: (doc) => {
    return {
      frontmatter: {
        title: doc.source.name,
        type: doc.type,
        generated: new Date().toISOString(),
        template: 'custom',
      },
    };
  },
});
