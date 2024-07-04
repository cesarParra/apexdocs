export const constructorsPartialTemplate = `
{{ heading headingLevel heading }}
{{#each value}}
{{{ heading headingLevel (inlineCode heading) }}}

{{#> documentablePartialTemplate}}

{{ heading signature.headingLevel signature.heading }}
{{ code "apex" signature.value }}

{{#if parameters.value}}
{{ heading parameters.headingLevel parameters.heading }}
| Name | Type | Description |
|------|------|-------------|
{{#each parameters.value}}
| {{name}} | {{type}} | {{description}} |
{{/each}}
{{/if}}

{{#if throws.value}}
{{ heading throws.headingLevel throws.heading }}
{{#each throws.value}}
{{link this.type}}: {{this.description}}

{{/each}}
{{/if}}
{{/documentablePartialTemplate}}

{{#unless @last}}---{{/unless}}

{{/each}}
`.trim();
