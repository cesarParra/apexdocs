export const triggerMarkdownTemplate = `
{{ heading headingLevel heading }}

## Trigger On {{ objectName }}

{{> typeDocumentation }}

**Events**
{{#each events}}
* {{this}}
{{/each}}
`.trim();
