export const classMarkdownTemplate = `
{{ heading headingLevel heading }}
{{#if classModifier}}
\`{{classModifier}}\`
{{/if}}

{{> typeDocumentation}}

{{#if extends}}
**Extends**
{{link extends}}
{{/if}}

{{#if implements}}
**Implements**
{{#each implements}}
{{link this}}{{#unless @last}}, {{/unless}}
{{/each}}
{{/if}}

{{#if fields.value}}
{{> fieldsPartialTemplate fields}}
{{/if}}

{{#if properties}}
{{> fieldsPartialTemplate properties}}
{{/if}}

{{#if constructors}}
{{> constructorsPartialTemplate constructors}}
{{/if}}

{{#if methods}}
{{> methodsPartialTemplate methods}}
{{/if}}
`.trim();
