export const interfaceMarkdownTemplate = `
{{ heading headingLevel heading }}

{{> typeDocumentation }}

{{#if extends}}
**Extends**
{{#each extends}}
{{link this}}{{#unless @last}}, {{/unless}}
{{/each}}
{{/if}}

{{#if methods}}
{{> methodsPartialTemplate methods}}
{{/if}}
`.trim();
