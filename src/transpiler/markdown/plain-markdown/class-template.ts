export const classMarkdownTemplate = `
# {{name}} Class
{{#if classModifier}}
\`{{classModifier}}\`
{{/if}}

{{> typeLevelApexDocPartialTemplate}}

{{#if extends}}
**Extends**
{{extends}}
{{/if}}

{{#if implements}}
**Implements**
{{#each implements}}
{{this}}{{#unless @last}}, {{/unless}}
{{/each}}
{{/if}}

{{#if constructors}}
{{> constructorsPartialTemplate}}
{{/if}}

{{#if methods}}
{{> methodsPartialTemplate}}
{{/if}}
`.trim();
