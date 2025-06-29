export const typeDocPartial = `
{{#> documentablePartialTemplate}}

{{#if doc.group}}
**{{@root.translations.markdown.details.group}}** {{doc.group}}
{{/if}}

{{#if doc.author}}
**{{@root.translations.markdown.details.author}}** {{doc.author}}
{{/if}}

{{#if doc.date}}
**{{@root.translations.markdown.details.date}}** {{doc.date}}
{{/if}}

{{#each doc.sees}}
**{{@root.translations.markdown.details.see}}** {{link this}}

{{/each}}

{{#if namespace}}
## {{@root.translations.markdown.sections.namespace}}
{{namespace}}
{{/if}}

{{/documentablePartialTemplate}}
`.trim();
