export const documentablePartialTemplate = `
{{#each doc.annotations}}
\`{{this}}\`
{{/each}}

{{withLinks doc.description}}

{{#each doc.customTags}}
**{{splitAndCapitalize name}}** {{withLinks description}}

{{/each}}

{{> @partial-block}}

{{#if doc.mermaid.value}}
{{ heading doc.mermaid.headingLevel doc.mermaid.heading }}
{{code "mermaid" doc.mermaid.value}}
{{/if}}

{{#if doc.example.value}}
{{ heading doc.example.headingLevel doc.example.heading }}
{{code "apex" doc.example.value}}
{{/if}}
`.trim();
