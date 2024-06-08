// TODO: What about modifiers (public, global, etc.)
export const enumMarkdownTemplate = `
# {{name}} enum
{{description}}

{{#if group}}
**Group** {{group}}
{{/if}}

{{#if author}}
**Author** {{author}}
{{/if}}

{{#if date}}
**Date** {{date}}
{{/if}}

{{#each customTags}}
**{{splitAndCapitalize name}}** {{value}}
{{/each}}

{{#each sees}}
**See** [{{title}}]({{url}})
{{/each}}

{{#each values}}
## {{value}}
{{description}}
{{/each}}
`.trim();
