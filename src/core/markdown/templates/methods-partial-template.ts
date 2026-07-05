export const methodsPartialTemplate = `
{{ heading headingLevel heading }}
{{#each value}}
{{{ heading headingLevel (inlineCode heading) }}}

{{#if inherited}}
*Inherited*
{{/if}}

{{#> documentablePartialTemplate}}

{{ heading signature.headingLevel signature.heading }}
{{ code signature.value }}

{{#if parameters.value}}
{{ heading parameters.headingLevel parameters.heading }}
| Name | Type | Description |
|------|------|-------------|
{{#each parameters.value}}
| {{name}} | {{link type}} | {{{renderContent description}}} |
{{/each}}
{{/if}}

{{ heading returnType.headingLevel returnType.heading }}
**{{link returnType.value.type}}**

{{#if returnType.value.description}}
{{{renderContent returnType.value.description}}}
{{/if}}

{{#if throws.value}}
{{ heading throws.headingLevel throws.heading }}
{{#each throws.value}}
{{link this.type}}: {{{renderContent this.description}}}

{{/each}}
{{/if}}

{{> docDetailsPartial}}
{{/documentablePartialTemplate}}

{{#unless @last}}---{{/unless}}

{{/each}}
`.trim();
