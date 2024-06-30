export const methodsPartialTemplate = `
{{ heading headingLevel heading }}
{{#each values}}
{{{ heading2 ../headingLevel (inlineCode title) }}}

{{#if inherited}}
*Inherited*
{{/if}}

TODO: This heading LEVEL STUFF IS BROKEN
{{#> documentablePartialTemplate doc headingLevel=../../headingLevel}}

{{ heading3 headingLevel "Signature" }}
\`\`\`apex
{{../signature}}
\`\`\` 

{{#if ../parameters}}
{{ heading3 ../../headingLevel "Parameters" }}
| Name | Type | Description |
|------|------|-------------|
{{#each ../parameters}}
| {{name}} | {{link type}} | {{withLinks description}} |
{{/each}}
{{/if}}

{{#if ../returnType}}
{{ heading3 ../../headingLevel "Return Type" }}
**{{link ../returnType.type}}**

{{../returnType.description}}
{{/if}}

{{#if ../throws}}
{{ heading3 ../../headingLevel "Throws" }}
{{#each ../throws}}
{{link this.type}}: {{this.description}}

{{/each}}
{{/if}}
{{/documentablePartialTemplate}}

{{#unless @last}}---{{/unless}}

{{/each}}
`.trim();
