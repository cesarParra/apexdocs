export const classMarkdownTemplate = `
# {{name}} Class
{{#if classModifier}}
\`{{classModifier}}\`
{{/if}}

{{> typeDocumentation}}

{{#if extends}}
**Extends**
{{extends}}
{{/if}}

{{#if implements}}
**Implements**
{{#each implements}}
{{this}}{{#unless @last}}, {{/unless}}
{{/each}}
{{/if}}

{{#if fields}}
{{> fieldsPartialTemplate title="Fields" fields=fields}}
{{/if}}

{{#if properties}}
{{> fieldsPartialTemplate title="Properties" fields=properties}}
{{/if}}

{{#if constructors}}
{{> constructorsPartialTemplate}}
{{/if}}

{{#if methods}}
{{> methodsPartialTemplate}}
{{/if}}
`.trim();
