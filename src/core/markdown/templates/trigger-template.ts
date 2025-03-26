export const triggerMarkdownTemplate = `
{{ heading headingLevel heading }}

## Trigger On {{ objectName }}

{{> typeDocumentation }}

**Run**
{{#each events}}
* {{this}}
{{/each}}
`.trim();
