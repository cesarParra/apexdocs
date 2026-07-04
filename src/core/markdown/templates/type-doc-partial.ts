export const typeDocPartial = `
{{#> documentablePartialTemplate}}

{{#if doc.group}}
**{{@root.translations.markdown.details.group}}** {{doc.group}}
{{/if}}

{{> docDetailsPartial}}

{{#if namespace}}
## {{@root.translations.markdown.sections.namespace}}
{{namespace}}
{{/if}}

{{/documentablePartialTemplate}}
`.trim();
