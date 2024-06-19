export const typeLevelApexDocPartialTemplate = `
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
TODO: REFACTOR>>>>>>>>>>WE WON'T WANT TO HANDLE URLS LIKE THIS SINCE THEY MIGHT NOT BE FOUND
**See** [{{title}}]({{url}})

{{/each}}

{{#if namespace}}
## Namespace
{{namespace}}
{{/if}}

{{/documentablePartialTemplate}}
`.trim();
