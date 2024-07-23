export const documentablePartialTemplate = `
{{#each doc.annotations}}
\`{{this}}\`
{{/each}}

{{renderContent doc.description}}

{{#each doc.customTags}}
**{{splitAndCapitalize name}}** {{renderContent description}}

{{/each}}

{{> @partial-block}}

{{#if doc.mermaid.value}}
{{ heading doc.mermaid.headingLevel doc.mermaid.heading }}
{{code doc.mermaid.value}}
{{/if}}

{{#if doc.example.value}}
{{ heading doc.example.headingLevel doc.example.heading }}
{{code doc.example.value}}
{{/if}}
`.trim();
