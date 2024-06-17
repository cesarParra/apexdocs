export const enumMarkdownTemplate = `
# {{namespacedName name}} enum

{{> typeLevelApexDocPartialTemplate}}

{{#each values}}
## {{value}}
{{description}}
{{/each}}
`.trim();
