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

{{#if properties.value}}
{{> fieldsPartialTemplate properties}}
{{/if}}

{{#if constructors.value}}
{{> constructorsPartialTemplate constructors}}
{{/if}}

{{#if methods.value}}
{{> methodsPartialTemplate methods}}
{{/if}}

{{#if innerClasses.value}}
{{ heading innerClasses.headingLevel innerClasses.heading }}
{{#each innerClasses.value}}
{{> classTemplate this}}
{{/each}}
{{/if}}

{{#if innerEnums.value}}
{{ heading innerEnums.headingLevel innerEnums.heading }}
{{#each innerEnums.value}}
{{> enumTemplate this}}
{{/each}}
{{/if}}

{{#if innerInterfaces.value}}
{{ heading innerInterfaces.headingLevel innerInterfaces.heading }}
{{#each innerInterfaces.value}}
{{> interfaceTemplate this}}
{{/each}}
{{/if}}
`.trim();
