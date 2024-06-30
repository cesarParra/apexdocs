export const interfaceMarkdownTemplate = `
# {{name}} Interface

{{> typeDocumentation}}

{{#if extends}}
**Extends**
{{#each extends}}
{{this}}{{#unless @last}}, {{/unless}}
{{/each}}
{{/if}}

{{#if methods}}
{{> methodsPartialTemplate}}
{{/if}}
`.trim();
