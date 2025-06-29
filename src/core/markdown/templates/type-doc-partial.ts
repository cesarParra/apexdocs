export const typeDocPartial = `
{{#> documentablePartialTemplate}}

{{#if doc.group}}
**{{#if translations.markdown.details.group}}{{translations.markdown.details.group}}{{else}}Group{{/if}}** {{doc.group}}
{{/if}}

{{#if doc.author}}
**{{#if translations.markdown.details.author}}{{translations.markdown.details.author}}{{else}}Author{{/if}}** {{doc.author}}
{{/if}}

{{#if doc.date}}
**{{#if translations.markdown.details.date}}{{translations.markdown.details.date}}{{else}}Date{{/if}}** {{doc.date}}
{{/if}}

{{#each doc.sees}}
**{{#if ../translations.markdown.details.see}}{{../translations.markdown.details.see}}{{else}}See{{/if}}** {{link this}}

{{/each}}

{{#if namespace}}
## {{#if translations.markdown.sections.namespace}}{{translations.markdown.sections.namespace}}{{else}}Namespace{{/if}}
{{namespace}}
{{/if}}

{{/documentablePartialTemplate}}
`.trim();
