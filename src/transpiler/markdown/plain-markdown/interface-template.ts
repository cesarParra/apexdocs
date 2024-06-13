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

{{#unless @last}}---{{/unless}}

{{/each}}
{{/if}}
`.trim();
