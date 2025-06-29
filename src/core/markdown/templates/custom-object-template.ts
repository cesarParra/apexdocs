export const customObjectTemplate = `
{{ heading headingLevel heading }}

{{{renderContent doc.description}}}

## {{#if translations.markdown.details.apiName}}{{translations.markdown.details.apiName}}{{else}}API Name{{/if}}
\`{{apiName}}\`

{{#if publishBehavior}}
## {{#if translations.markdown.sections.publishBehavior}}{{translations.markdown.sections.publishBehavior}}{{else}}Publish Behavior{{/if}}

**{{publishBehavior}}**
{{/if}}

{{#if hasFields}}
{{ heading fields.headingLevel fields.heading }}
{{#each fields.value}}
{{ heading headingLevel heading }}
{{#if required}}
**{{#if translations.markdown.details.required}}{{translations.markdown.details.required}}{{else}}Required{{/if}}**
{{/if}}

{{#if description}}
{{{renderContent description}}}
{{/if}}

{{#if inlineHelpText}}
**{{#if translations.markdown.details.inlineHelpText}}{{translations.markdown.details.inlineHelpText}}{{else}}Inline Help Text{{/if}}**
{{inlineHelpText}}
{{/if}}

{{#if complianceGroup}}
**{{#if translations.markdown.details.complianceGroup}}{{translations.markdown.details.complianceGroup}}{{else}}Compliance Group{{/if}}**
{{complianceGroup}}
{{/if}}

{{#if securityClassification}}
**{{#if translations.markdown.details.securityClassification}}{{translations.markdown.details.securityClassification}}{{else}}Security Classification{{/if}}**
{{securityClassification}}
{{/if}}

**{{#if translations.markdown.details.apiName}}{{translations.markdown.details.apiName}}{{else}}API Name{{/if}}**

\`{{{apiName}}}\`

{{#if fieldType}}
**{{#if translations.markdown.details.type}}{{translations.markdown.details.type}}{{else}}Type{{/if}}**

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
\`{{#if translations.markdown.details.protected}}{{translations.markdown.details.protected}}{{else}}Protected{{/if}}\`
{{/if}}

{{#if description}}
{{{renderContent description}}}
{{/if}}

**{{#if translations.markdown.details.apiName}}{{translations.markdown.details.apiName}}{{else}}API Name{{/if}}**

\`{{{apiName}}}\`

{{#unless @last}}---{{/unless}}
{{/each}}
{{/if}}

`.trim();
