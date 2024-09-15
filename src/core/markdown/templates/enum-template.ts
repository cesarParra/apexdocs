export const enumMarkdownTemplate = `
{{ heading headingLevel heading }}

{{> typeDocumentation }}

{{ heading values.headingLevel values.heading }}
| Value | Description |
|-------|-------------|
{{#each values.value}}
| {{value}} | {{description}} |
{{/each}}
`.trim();
