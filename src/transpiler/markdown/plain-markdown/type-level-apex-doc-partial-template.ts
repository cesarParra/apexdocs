export const typeLevelApexDocPartialTemplate = `
Access: \`{{accessModifier}}\`

{{#if annotations}}
{{#each annotations}}
\`{{this}}\`
{{/each}}
{{/if}}

{{description}}

{{#if group}}
**Group** {{group}}
{{/if}}

{{#if author}}
**Author** {{author}}
{{/if}}

{{#if date}}
**Date** {{date}}
{{/if}}

{{#each customTags}}
**{{splitAndCapitalize name}}** {{value}}

{{/each}}

{{#each sees}}
**See** [{{title}}]({{url}})

{{/each}}

{{{mermaid}}}

{{{example}}}
`.trim();
