// TODO: mermaid tags
// TODO: handle when the description has multiple lines since we'd like to respect that

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
`.trim();
