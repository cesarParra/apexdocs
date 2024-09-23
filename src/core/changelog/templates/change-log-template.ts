export const changeLogTemplate = `
# Change Log

{{#if newClasses}}
## {{newClasses.heading}}

{{newClasses.description}}
{{/if}}
`.trim();
