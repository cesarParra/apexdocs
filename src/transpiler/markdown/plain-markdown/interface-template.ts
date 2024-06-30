export const interfaceMarkdownTemplate = `
# {{name}} Interface

{{> typeDocumentation doc}}

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
