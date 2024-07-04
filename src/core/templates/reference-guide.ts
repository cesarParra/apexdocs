export const referenceGuideTemplate = `
# Apex Reference Guide

{{#each this}}
## {{@key}}

{{#each this}}
### {{link title}}

{{withLinks description}}

{{/each}}
{{/each}}
`.trim();
