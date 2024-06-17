export const interfaceMarkdownTemplate = `
# {{name}} interface

{{> typeLevelApexDocPartialTemplate}}

{{#if extends}}
**Extends**
{{#each extends}}
[{{title}}]({{url}}){{#unless @last}}, {{/unless}}
{{/each}}
{{/if}}

{{#if methods}}
## Methods
{{#each methods}}
### \`{{declaration}}\`

{{#each annotations}}
\`{{this}}\`
{{/each}}

{{description}}

{{#if parameters}}
#### Parameters
| Name | Type | Description |
|------|------|-------------|
{{#each parameters}}
| {{name}} | {{type}} | {{description}} |
{{/each}}
{{/if}}

{{#if returnType}}
#### Returns
{{returnType.type}}: {{returnType.description}}
{{/if}}

{{#if throws}}
#### Throws
{{#each throws}}
{{this.type}}: {{this.description}}

{{/each}}
{{/if}}

{{#each customTags}}
**{{splitAndCapitalize name}}** {{value}}

{{/each}}

{{{mermaid}}}

{{#unless @last}}---{{/unless}}

{{/each}}
{{/if}}
`.trim();
