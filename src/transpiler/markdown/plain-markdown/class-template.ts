export const classMarkdownTemplate = `
# {{name}} Class
{{#if classModifier}}
\`{{classModifier}}\`
{{/if}}

{{> typeLevelApexDocPartialTemplate}}
`.trim();
