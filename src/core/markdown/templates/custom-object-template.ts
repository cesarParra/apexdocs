export const customObjectTemplate = `
{{ heading headingLevel heading }}

{{{renderContent doc.description}}}

## API Name
\`{{apiName}}\`

{{#if publishBehavior}}
## Publish Behavior

**{{publishBehavior}}**
{{/if}}

{{#if hasFields}}
{{ heading fields.headingLevel fields.heading }}
{{#each fields.value}}
{{ heading headingLevel heading }}
{{#if required}}
**Required**
{{/if}}

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

{{#if hasRecords}}
{{ heading metadataRecords.headingLevel metadataRecords.heading }}
{{#each metadataRecords.value}}
{{ heading headingLevel heading }}

{{#if protected}}
\`Protected\`
{{/if}}

{{#if description}}
{{{renderContent description}}}
{{/if}}

**API Name**

\`{{{apiName}}}\`

{{#unless @last}}---{{/unless}}
{{/each}}
{{/if}}

`.trim();
