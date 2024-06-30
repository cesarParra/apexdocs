export const fieldsPartialTemplate = `
{{ heading headingLevel heading }}
{{#each value}}
### \`\{{name}}\`

{{#if inherited}}
*Inherited*
{{/if}}

{{#> documentablePartialTemplate }}

{{ heading signature.headingLevel signature.heading }}
{{ code "apex" signature.value }}

{{ heading type.headingLevel type.heading }}
{{link type.value}}

{{/documentablePartialTemplate}}

{{#unless @last}}---{{/unless}}

{{/each}}
`.trim();
