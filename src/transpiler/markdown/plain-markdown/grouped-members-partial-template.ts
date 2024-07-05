export const groupedMembersPartialTemplate = `
{{ heading headingLevel heading }}
{{#each value}}
{{> (lookup .. "subTemplate") this}}
{{/each}}
`.trim();
