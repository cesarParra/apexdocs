export const fieldsPartialTemplate = `
## Fields
{{#each fields}}
### \`\{{name}}\`

{{#if inherited}}
*Inherited*
{{/if}}

{{#> documentablePartialTemplate}}

#### Type
{{type}}

{{/documentablePartialTemplate}}

{{#unless @last}}---{{/unless}}

{{/each}}
`.trim();
