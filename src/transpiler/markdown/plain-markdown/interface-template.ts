export const interfaceMarkdownTemplate = `
# {{name}} interface
Access: \`{{accessModifier}}\`

{{#if annotations}}
{{#each annotations}}
\`@{{this}}\`
{{/each}}
{{/if}}

{{> typeLevelApexDocPartialTemplate}}
`.trim();
