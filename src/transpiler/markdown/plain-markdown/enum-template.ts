// TODO: author
// TODO: date
// TODO: mermaid tags
// TODO: custom tags
// TODO: handle when the description has multiple lines since we'd like to respect that

export const enumMarkdownTemplate = `
# {{name}} enum
{{description}}

{{#if group}}
** Group {{group}}
{{/if}}

{{#each sees}}
**See** [{{title}}]({{url}})
{{/each}}
`.trim();
