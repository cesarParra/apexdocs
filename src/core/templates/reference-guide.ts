export const referenceGuideTemplate = `
# Apex Reference Guide

{{#each this}}
## {{link title}}

{{#each description}}
{{withLinks this}}
{{/each}}

{{/each}}
`.trim();
