export const referenceGuideTemplate = `
# Apex Reference Guide

{{#each this}}
## {{@key}}

{{#each this}}
### {{link title}}

{{{renderContent description}}}

{{/each}}
{{/each}}
`.trim();
