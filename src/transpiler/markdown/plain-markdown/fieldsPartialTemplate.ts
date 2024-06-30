export const fieldsPartialTemplate = `
## {{title}}
{{#each fields}}
### \`\{{name}}\`

{{#if inherited}}
*Inherited*
{{/if}}

{{#> documentablePartialTemplate isInner=true}}

#### Signature
\`\`\`apex
{{signature}}
\`\`\` 

#### Type
{{type}}

{{/documentablePartialTemplate}}

{{#unless @last}}---{{/unless}}

{{/each}}
`.trim();
