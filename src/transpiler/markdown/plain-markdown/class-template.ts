export const classMarkdownTemplate = `
# {{name}} Class
{{#if classModifier}}
\`{{classModifier}}\`
{{/if}}

{{> typeLevelApexDocPartialTemplate}}

{{#if implements}}
**Implements**
{{#each implements}}
{{this}}{{#unless @last}}, {{/unless}}
{{/each}}
{{/if}}
`.trim();
