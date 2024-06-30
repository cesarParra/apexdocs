export const methodsPartialTemplate = `
## Methods
{{#each methods}}
### \`{{title}}\`

{{#if inherited}}
*Inherited*
{{/if}}

{{#> documentablePartialTemplate isInner=true}}

#### Signature
\`\`\`apex
{{signature}}
\`\`\` 

{{#if parameters}}
#### Parameters
| Name | Type | Description |
|------|------|-------------|
{{#each parameters}}
| {{name}} | {{type}} | {{description}} |
{{/each}}
{{/if}}

{{#if returnType}}
#### Returns
**{{returnType.type}}**

{{returnType.description}}
{{/if}}

{{#if throws}}
#### Throws
{{#each throws}}
{{this.type}}: {{this.description}}

{{/each}}
{{/if}}
{{/documentablePartialTemplate}}

{{#unless @last}}---{{/unless}}

{{/each}}
`.trim();
