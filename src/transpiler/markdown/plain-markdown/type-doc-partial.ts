export const typeDocPartial = `
{{#> documentablePartialTemplate}}

{{#if group}}
**Group** {{group}}
{{/if}}

{{#if author}}
**Author** {{author}}
{{/if}}

{{#if date}}
**Date** {{date}}
{{/if}}

{{#each sees}}
**See** {{link this}}

{{/each}}

{{#if namespace}}
## Namespace
{{namespace}}
{{/if}}

{{/documentablePartialTemplate}}
`.trim();
