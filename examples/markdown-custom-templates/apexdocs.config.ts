import { defineMarkdownConfig } from '../../src';
import type {
  TemplateConfig,
  TemplateHelpers,
  RenderableClass,
  RenderableTrigger,
  ReferenceGuideData,
  ReferenceGuideReference,
} from '../../src';
import type {
  Renderable,
  RenderableConstructor,
  RenderableMethod,
  RenderableApexField,
  GroupedMember,
  RenderableMethodParameter,
  RenderableSection,
  TypeSource,
} from '../../src/core/renderables/types';

/**
 * Custom template configuration for ApexDocs markdown generation.
 * This example demonstrates both string templates (Handlebars) and function templates (JavaScript/TypeScript).
 */

// Helper functions to reduce duplication in class template

/**
 * Renders parameters section for constructors and methods
 */
function renderParameters(parameters: RenderableMethodParameter[] | undefined, helpers: TemplateHelpers): string {
  if (!parameters || parameters.length === 0) {
    return '';
  }
  const { heading, inlineCode, renderContent } = helpers;
  let output = `${heading(4, 'Parameters')}\n\n`;
  parameters.forEach((param) => {
    output += `- ${inlineCode(param.name)}`;
    output += ` (${typeof param.type === 'string' ? param.type : param.type.title})`;
    if (param.description && param.description.length > 0) {
      output += `: ${renderContent(param.description)}`;
    }
    output += '\n';
  });
  output += '\n';
  return output;
}

/**
 * Renders return type section for methods
 */
function renderReturnType(returnType: TypeSource | undefined, helpers: TemplateHelpers): string {
  if (!returnType) {
    return '';
  }
  const { heading, renderContent } = helpers;
  let output = `${heading(4, 'Returns')}\n\n`;
  output += `- **Type:** ${typeof returnType.type === 'string' ? returnType.type : returnType.type.title}\n`;
  if (returnType.description && returnType.description.length > 0) {
    output += `- **Description:** ${renderContent(returnType.description)}\n`;
  }
  output += '\n';
  return output;
}

/**
 * Renders a single constructor
 */
function renderConstructor(ctor: RenderableConstructor, helpers: TemplateHelpers): string {
  const { heading, renderContent } = helpers;
  let output = `${heading(3, ctor.heading)}\n\n`;

  if (ctor.doc && ctor.doc.description && ctor.doc.description.length > 0) {
    output += `${renderContent(ctor.doc.description)}\n\n`;
  }

  output += renderParameters(ctor.parameters?.value, helpers);

  return output;
}

/**
 * Renders a single property
 */
function renderProperty(prop: RenderableApexField, helpers: TemplateHelpers): string {
  const { heading, renderContent } = helpers;
  let output = `${heading(3, prop.heading)}\n\n`;

  if (prop.doc && prop.doc.description && prop.doc.description.length > 0) {
    output += `${renderContent(prop.doc.description)}\n\n`;
  }

  output += `- **Type:** ${typeof prop.type.value === 'string' ? prop.type.value : prop.type.value.title}\n`;
  if (prop.accessModifier && prop.accessModifier !== 'public') {
    output += `- **Access:** ${prop.accessModifier}\n`;
  }
  output += '\n';
  return output;
}

/**
 * Renders a single method
 */
function renderMethod(method: RenderableMethod, helpers: TemplateHelpers): string {
  const { heading, renderContent } = helpers;
  let output = `${heading(3, method.heading)}\n\n`;

  if (method.doc && method.doc.description && method.doc.description.length > 0) {
    output += `${renderContent(method.doc.description)}\n\n`;
  }

  output += renderParameters(method.parameters?.value, helpers);
  output += renderReturnType(method.returnType?.value, helpers);

  // Add separator between methods
  output += '---\n\n';
  return output;
}

/**
 * Renders grouped members (constructors, properties, or methods)
 */
function renderGroupedMembers<T>(
  groupedMembers: GroupedMember<T>[],
  renderItem: (item: T, helpers: TemplateHelpers) => string,
  helpers: TemplateHelpers,
): string {
  const { heading, renderContent } = helpers;
  let output = '';

  groupedMembers.forEach((group) => {
    if (group.groupDescription) {
      output += `${heading(3, group.heading)}\n\n`;
      output += `${renderContent([group.groupDescription])}\n\n`;
    }
    group.value.forEach((item: T) => {
      output += renderItem(item, helpers);
    });
  });

  return output;
}

/**
 * Renders members (grouped or non-grouped)
 */
function renderMembers<T>(
  members: T[] | GroupedMember<T>[],
  isGrouped: boolean,
  renderItem: (item: T, helpers: TemplateHelpers) => string,
  helpers: TemplateHelpers,
): string {
  if (isGrouped) {
    return renderGroupedMembers(members as GroupedMember<T>[], renderItem, helpers);
  } else {
    let output = '';
    (members as T[]).forEach((item: T) => {
      output += renderItem(item, helpers);
    });
    return output;
  }
}

/**
 * Renders a member section (constructors, properties, methods) with proper heading
 */
function renderMemberSection<T>(
  section: RenderableSection<T[] | GroupedMember<T>[]> & { isGrouped: boolean },
  title: string,
  renderItem: (item: T, helpers: TemplateHelpers) => string,
  helpers: TemplateHelpers,
): string {
  const { heading } = helpers;
  if (!section.value || !Array.isArray(section.value) || section.value.length === 0) {
    return '';
  }
  let output = `${heading(2, title)}\n\n`;
  output += renderMembers(section.value, section.isGrouped, renderItem, helpers);
  return output;
}

const customTemplates: TemplateConfig = {
  /**
   * Function template for classes - demonstrates dynamic template generation with full TypeScript support
   */
  class: (renderable: RenderableClass, helpers: TemplateHelpers): string => {
    const { heading, renderContent, inlineCode, splitAndCapitalize } = helpers;
    // Type alias for renderable with filePath (available in actual Renderable union)
    const renderableWithFile = renderable as RenderableClass & Pick<Renderable, 'filePath'>;

    let output = `${heading(1, renderable.name)}\n\n`;

    // Class metadata
    output += '## Class Information\n\n';
    output += `- **Type:** ${splitAndCapitalize(renderable.type)}\n`;
    output += `- **Access Modifier:** ${renderable.meta.accessModifier || 'public'}\n`;

    if (renderable.extends && renderable.extends.length > 0) {
      output += `- **Extends:** ${renderable.extends.map((e) => (typeof e === 'string' ? e : e.title)).join(', ')}\n`;
    }

    if (renderable.implements && renderable.implements.length > 0) {
      output += `- **Implements:** ${renderable.implements.map((i) => (typeof i === 'string' ? i : i.title)).join(', ')}\n`;
    }

    if (renderableWithFile.filePath) {
      output += `- **File:** ${renderableWithFile.filePath}\n`;
    }
    output += '\n';

    // Annotations
    if (renderable.doc.annotations && renderable.doc.annotations.length > 0) {
      output += `${heading(2, 'Annotations')}\n\n`;
      renderable.doc.annotations.forEach((annotation) => {
        output += `- ${inlineCode(annotation)}`;
        output += '\n';
      });
      output += '\n';
    }

    // Description
    if (renderable.doc.description && renderable.doc.description.length > 0) {
      output += `${heading(2, 'Description')}\n\n`;
      output += `${renderContent(renderable.doc.description)}\n\n`;
    }

    // Constructors
    output += renderMemberSection(renderable.constructors, 'Constructors', renderConstructor, helpers);

    // Properties
    output += renderMemberSection(renderable.properties, 'Properties', renderProperty, helpers);

    // Methods
    output += renderMemberSection(renderable.methods, 'Methods', renderMethod, helpers);

    // Example section
    if (renderable.doc.example && renderable.doc.example.value && renderable.doc.example.value.length > 0) {
      output += `${heading(2, 'Examples')}\n\n`;
      output += `${renderContent(renderable.doc.example.value)}\n`;
    } else {
      output += `${heading(2, 'Examples')}\n\n`;
      output += '```apex\n';
      output += `// Example usage of ${renderable.name}\n`;
      output += `${renderable.name} instance = new ${renderable.name}();\n`;
      output += '// Add your example code here\n';
      output += '```\n';
    }

    return output;
  },

  /**
   * String template for enums - demonstrates Handlebars syntax
   * String templates are simpler but have access to all the same helpers
   */
  enum: `# {{name}}

{{renderContent doc.description}}

## Enum Values

{{#each values.value}}
### {{value}}
{{#if description}}
{{renderContent description}}
{{/if}}
{{/each}}

---

*Generated with custom enum template*`,

  /**
   * String template for interfaces
   */
  interface: `# {{name}} Interface

{{renderContent doc.description}}

## Interface Details
- **Type:** Interface
- **Access Modifier:** {{meta.accessModifier}}

{{#if extends.length}}
## Extended Interfaces
{{#each extends}}
- {{this}}
{{/each}}
{{/if}}

## Methods

{{#each methods.value}}
### {{heading}}
{{renderContent doc.description}}

**Signature:** {{meta.accessModifier}} {{heading}}({{#each parameters.value}}{{type}} {{name}}{{#unless @last}}, {{/unless}}{{/each}}){{#if returnType.value}}: {{returnType.value.type}}{{/if}}

{{#if parameters.value.length}}
#### Parameters
{{#each parameters.value}}
- **{{name}}** ({{type}}){{#if description}}: {{renderContent description}}{{/if}}
{{/each}}
{{/if}}

{{/each}}

---

*Generated with custom interface template*`,

  /**
   * Simple function template for triggers
   */
  trigger: (renderable: RenderableTrigger, helpers: TemplateHelpers): string => {
    const { heading, renderContent } = helpers;

    let output = `${heading(1, renderable.name)}\n\n`;

    if (renderable.doc.description && renderable.doc.description.length > 0) {
      output += `${renderContent(renderable.doc.description)}\n\n`;
    }

    output += `**Object:** ${renderable.objectName}\n\n`;
    output += `**Events:** ${renderable.events.join(', ')}\n\n`;
    output += `*Custom trigger template generated*\n`;

    return output;
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
    Object.values(data.references).forEach((group) => {
      totalCount += group.length;
    });

    output += `## Overview\n\n`;
    output += `- **Total Items:** ${totalCount}\n`;
    output += `- **Groups:** ${Object.keys(data.references).length}\n\n`;

    // Group references alphabetically
    const sortedGroups = Object.keys(data.references).sort();

    sortedGroups.forEach((groupName) => {
      const groupItems = data.references[groupName];

      output += `${heading(2, groupName)}\n\n`;

      groupItems.forEach((item: ReferenceGuideReference) => {
        output += `- [${item.title.title}](${item.title.url})`;
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
