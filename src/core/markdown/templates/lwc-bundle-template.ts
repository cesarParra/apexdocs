export const lwcBundleTemplate = `
{{ heading headingLevel heading }}

{{#if exposed}}
\`{{@root.translations.markdown.lwc.exposed}}\`
{{/if}}

{{#if description}}
{{description}}
{{/if}}

{{#if targets.value.length}}
{{ heading targets.headingLevel targets.heading }}
{{#each targets.value}}
- {{this}}
{{/each}}
{{/if}}

{{#if targetConfigs.value.length}}
{{ heading targetConfigs.headingLevel targetConfigs.heading }}

{{#each targetConfigs.value}}
### {{ targetName }}

#### {{@root.translations.markdown.lwc.properties}}

{{#each properties}}
**{{label}}** \`{{name}}\`

{{#if description}}{{description}}{{/if}}

- **{{@root.translations.markdown.details.type}}:** {{type}}
- **{{@root.translations.markdown.details.required}}:** {{required}}

{{/each}}
{{/each}}
{{/if}}
`.trim();
