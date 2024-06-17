export const enumMarkdownTemplate = `
# {{name}} Enum

{{> typeLevelApexDocPartialTemplate}}

{{#each values}}
## {{value}}
{{description}}
{{/each}}
`.trim();
