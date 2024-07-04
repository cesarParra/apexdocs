export const referenceGuideTemplate = `
# Apex Reference Guide

{{#each this}}
## {{link title}}

{{withLinks description}}

{{/each}}
`.trim();
