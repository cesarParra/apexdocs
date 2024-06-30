export const documentablePartialTemplate = `
{{#each annotations}}
\`{{this}}\`
{{/each}}

{{withLinks description}}

{{#each customTags}}
**{{splitAndCapitalize name}}** {{withLinks description}}

{{/each}}

{{> @partial-block}}

{{#if mermaid}}
{{code "mermaid" mermaid}}
{{/if}}

{{#if example}}
{{ heading3 ../../headingLevel "Example" }}
{{code "apex" example}}
{{/if}}
`.trim();
