export const docDetailsPartial = `
{{#each doc.authors}}
**{{@root.translations.markdown.details.author}}** {{this}}

{{/each}}
{{#if doc.date}}
**{{@root.translations.markdown.details.date}}** {{doc.date}}
{{/if}}

{{#each doc.sees}}
**{{@root.translations.markdown.details.see}}** {{link this}}

{{/each}}
`.trim();
