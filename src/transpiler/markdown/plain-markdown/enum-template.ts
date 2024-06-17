export const enumMarkdownTemplate = `
# {{name}} enum

{{> typeLevelApexDocPartialTemplate}}

{{#each values}}
## {{value}}
{{description}}
{{/each}}
`.trim();
