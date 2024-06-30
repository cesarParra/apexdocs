export const documentablePartialTemplate = `
{{#each annotations}}
\`{{this}}\`
{{/each}}

{{description}}

{{#each customTags}}
**{{splitAndCapitalize name}}** {{description}}

{{/each}}

{{> @partial-block}}

{{{mermaid}}}

{{#if example}}
##{{#if isInner}}##{{/if}} Example
{{{example}}}
{{/if}}
`.trim();
