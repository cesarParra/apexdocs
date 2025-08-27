export const lwcBundleTemplate = `
{{ heading headingLevel heading }}

{{#if exposed}}
\`Exposed\`
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

#### Properties

{{#each properties}}
**{{label}}** \`{{name}}\`

{{#if description}}{{description}}{{/if}}

- **Type:** {{type}}
- **Required:** {{required}}

{{/each}}
{{/each}}
{{/if}}
`.trim();
