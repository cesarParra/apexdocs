export const constructorsPartialTemplate = `
## Constructors
{{#each constructors}}
### \`{{title}}\`

{{#each annotations}}
\`{{this}}\`
{{/each}}

{{description}}

### Signature
\`\`\`apex
{{signature}}
\`\`\` 

{{#if parameters}}
### Parameters
| Name | Type | Description |
|------|------|-------------|
{{#each parameters}}
| {{name}} | {{type}} | {{description}} |
{{/each}}
{{/if}}

{{#if throws}}
### Throws
{{#each throws}}
{{this.type}}: {{this.description}}

{{/each}}
{{/if}}

{{#each customTags}}
**{{splitAndCapitalize name}}** {{value}}

{{/each}}

{{{mermaid}}}

{{{example}}}

{{#unless @last}}---{{/unless}}
{{/each}}

`.trim();
