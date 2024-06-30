export const typeDocPartial = `
{{#> documentablePartialTemplate}}

{{#if doc.group}}
**Group** {{doc.group}}
{{/if}}

{{#if doc.author}}
**Author** {{doc.author}}
{{/if}}

{{#if doc.date}}
**Date** {{doc.date}}
{{/if}}

{{#each doc.sees}}
**See** {{link this}}

{{/each}}

{{#if namespace}}
## Namespace
{{namespace}}
{{/if}}

{{/documentablePartialTemplate}}
`.trim();
