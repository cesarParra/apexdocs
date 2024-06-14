export const interfaceMarkdownTemplate = `
# {{name}} interface
Access: \`{{accessModifier}}\`

{{#if extends}}
**Extends**
{{#each extends}}
[{{title}}]({{url}}){{#unless @last}}, {{/unless}}
{{/each}}
{{/if}}

{{#if annotations}}
{{#each annotations}}
\`{{this}}\`
{{/each}}
{{/if}}

{{> typeLevelApexDocPartialTemplate}}

{{{mermaid}}}

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

{{#unless @last}}---{{/unless}}

{{/each}}
{{/if}}
`.trim();
