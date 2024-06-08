export const enumMarkdownTemplate = `
# {{name}} enum
Access: \`{{accessModifier}}\`

{{> typeLevelApexDocPartialTemplate}}

{{#each values}}
## {{value}}
{{description}}
{{/each}}
`.trim();
