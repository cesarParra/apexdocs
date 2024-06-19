export const documentablePartialTemplate = `
{{#each annotations}}
\`{{this}}\`
{{/each}}

{{description}}

{{#each customTags}}
**{{splitAndCapitalize name}}** {{value}}

{{/each}}

{{> @partial-block}}

{{{mermaid}}}

{{#if example}}
TODO: This should be a different heading level when inside of a field, method or constructor
## Example
{{{example}}}
{{/if}}
`.trim();
