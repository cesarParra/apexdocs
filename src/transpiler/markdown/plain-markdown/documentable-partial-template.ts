export const documentablePartialTemplate = `
{{#each annotations}}
\`{{this}}\`
{{/each}}

{{withLinks description}}

{{#each customTags}}
**{{splitAndCapitalize name}}** {{withLinks description}}

{{/each}}

{{> @partial-block}}

{{#if mermaid.value}}
{{ heading mermaid.headingLevel mermaid.heading }}
{{code "mermaid" mermaid.value}}
{{/if}}

{{#if example.value}}
{{ heading example.headingLevel example.heading }}
{{code "apex" example.value}}
{{/if}}
`.trim();
