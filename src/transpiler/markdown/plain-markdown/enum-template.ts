// TODO: group
// TODO: author
// TODO: date
// TODO: mermeid tags
// TODO: custom tags
// TODO: handle when the description has multiple lines since we'd like to respect that

export const enumMarkdownTemplate = `
# {{ name}} enum
{{ description }}

{{#each sees}}
**See** [{{title}}]({{url}})
{{/each}}
`.trim();
