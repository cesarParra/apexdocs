export const groupedMembersPartialTemplate = `
{{ heading headingLevel heading }}
{{#each value}}
{{> fieldsPartialTemplate this}}
{{/each}}
`.trim();
