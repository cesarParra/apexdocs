export const methodsPartialTemplate = `
## Methods
{{#each methods}}
### \`{{title}}\`

{{#if inherited}}
*Inherited*
{{/if}}

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

{{#if returnType}}
### Returns
**{{returnType.type}}**

{{returnType.description}}
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
