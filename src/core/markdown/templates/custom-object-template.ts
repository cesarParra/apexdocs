export const customObjectTemplate = `
{{ heading headingLevel heading }}

{{{renderContent doc.description}}}

## API Name
\`{{apiName}}\`

{{#if hasFields}}
{{ heading fields.headingLevel fields.heading }}
{{#each fields.value}}
{{ heading headingLevel heading }}

{{#if description}}
{{{renderContent description}}}
{{/if}}

**API Name**

\`{{{apiName}}}\`

{{#if fieldType}}
**Type**

*{{fieldType}}*

{{#if pickListValues}}
{{ heading pickListValues.headingLevel pickListValues.heading }}
{{#each pickListValues.value}}
* {{{this}}}
{{/each}}
{{/if}}
{{/if}}

{{#unless @last}}---{{/unless}}
{{/each}}
{{/if}}

`.trim();
