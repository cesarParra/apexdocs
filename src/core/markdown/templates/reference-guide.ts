export const referenceGuideTemplate = `
# {{referenceGuideTitle}}

{{#each references}}
## {{@key}}

{{#each this}}
### {{link title}}

{{{renderContent description}}}

{{/each}}
{{/each}}
`.trim();
