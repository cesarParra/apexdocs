export const constructorsPartialTemplate = `
## Constructors
{{#each constructors}}
### \`{{title}}\`

{{#> documentablePartialTemplate}}

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

{{/documentablePartialTemplate}}

{{#unless @last}}---{{/unless}}
{{/each}}

`.trim();
