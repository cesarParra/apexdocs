export const customObjectTemplate = `
{{ heading headingLevel heading }}

{{{renderContent doc.description}}}

## {{@root.translations.markdown.details.apiName}}
\`{{apiName}}\`

{{#if publishBehavior}}
## {{@root.translations.markdown.sections.publishBehavior}}

**{{publishBehavior}}**
{{/if}}

{{#if hasFields}}
{{ heading fields.headingLevel fields.heading }}
{{#each fields.value}}
{{ heading headingLevel heading }}
{{#if required}}
**{{@root.translations.markdown.details.required}}**
{{/if}}

{{#if description}}
{{{renderContent description}}}
{{/if}}

{{#if inlineHelpText}}
**{{@root.translations.markdown.details.inlineHelpText}}**
{{inlineHelpText}}
{{/if}}

{{#if complianceGroup}}
**{{@root.translations.markdown.details.complianceGroup}}**
{{complianceGroup}}
{{/if}}

{{#if securityClassification}}
**{{@root.translations.markdown.details.securityClassification}}**
{{securityClassification}}
{{/if}}

**{{@root.translations.markdown.details.apiName}}**

\`{{{apiName}}}\`

{{#if fieldType}}
**{{@root.translations.markdown.details.type}}**

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
\`{{@root.translations.markdown.details.protected}}\`
{{/if}}

{{#if description}}
{{{renderContent description}}}
{{/if}}

**{{@root.translations.markdown.details.apiName}}**

\`{{{apiName}}}\`

{{#unless @last}}---{{/unless}}
{{/each}}
{{/if}}

`.trim();
