export const constructorsPartialTemplate = `
{{ heading headingLevel heading }}
{{#each value}}
{{{ heading headingLevel (inlineCode heading) }}}

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
