export const customObjectTemplate = `
{{ heading headingLevel heading }}

{{{renderContent doc.description}}}

## API Name
\`{{apiName}}\`

{{#if hasFields}}
{{ heading fields.headingLevel fields.heading }}
| Field Name | Details |
|-------|-------------|
{{#each fields.value}}
| **{{ label }}** | {{{renderContent description}}} |
{{/each}}
{{/if}}

`.trim();
