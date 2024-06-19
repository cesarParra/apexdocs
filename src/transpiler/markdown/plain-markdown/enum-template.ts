export const enumMarkdownTemplate = `
# {{name}} Enum

{{> typeLevelApexDocPartialTemplate}}

## Enum Values
{{#each values}}
### {{value}}
{{description}}
{{/each}}
`.trim();
