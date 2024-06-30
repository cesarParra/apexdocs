export const enumMarkdownTemplate = `
{{ heading headingLevel heading }}

{{> typeDocumentation doc }}

{{ heading values.headingLevel values.heading }}
| Value | Description |
|-------|-------------|
{{#each values.values}}
| {{value}} | {{description}} |
{{/each}}
`.trim();
