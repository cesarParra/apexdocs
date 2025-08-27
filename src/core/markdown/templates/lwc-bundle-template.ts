export const lwcBundleTemplate = `
{{ heading headingLevel heading }}

{{#if doc.customTags}}
{{#each doc.customTags}}
{{#if (eq name "exposed")}}
{{#each description}}
{{{inlineCode this}}}
{{/each}}
{{/if}}
{{/each}}
{{/if}}

{{{renderContent doc.description}}}

{{#if doc.customTags}}
{{#each doc.customTags}}
{{#if (eq name "targets")}}
{{ heading (add headingLevel 1) "Targets" }}

{{#each description}}
{{this}}
{{/each}}
{{/if}}
{{/each}}
{{/if}}

{{#if doc.customTags}}
{{#each doc.customTags}}
{{#if (eq name "targetConfig")}}
{{#each description}}
{{this}}
{{/each}}
{{/if}}
{{/each}}
{{/if}}
`.trim();
