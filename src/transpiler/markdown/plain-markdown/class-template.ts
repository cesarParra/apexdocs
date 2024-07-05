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
{{#if fields.isGrouped}}
{{> groupedMembersPartialTemplate fields subTemplate="fieldsPartialTemplate"}}
{{else}}
{{> fieldsPartialTemplate fields}}
{{/if}}
{{/if}}

{{#if properties.value}}
{{#if properties.isGrouped}}
{{> groupedMembersPartialTemplate properties subTemplate="fieldsPartialTemplate"}}
{{else}}
{{> fieldsPartialTemplate properties}}
{{/if}}
{{/if}}

{{#if constructors.value}}
{{#if constructors.isGrouped}}
{{> groupedMembersPartialTemplate constructors subTemplate="constructorsPartialTemplate"}}
{{else}}
{{> constructorsPartialTemplate constructors}}
{{/if}}
{{/if}}

{{#if methods.value}}
{{#if methods.isGrouped}}
{{> groupedMembersPartialTemplate methods subTemplate="methodsPartialTemplate"}}
{{else}}
{{> methodsPartialTemplate methods}}
{{/if}}
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
