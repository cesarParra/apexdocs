export const enumMarkdownTemplate = `
{{ heading headingLevel heading }}

{{#with doc}}
{{> typeDocumentation }}
{{/with}}

{{ heading values.headingLevel values.heading }}
| Value | Description |
|-------|-------------|
{{#each values.value}}
| {{value}} | {{description}} |
{{/each}}
`.trim();
