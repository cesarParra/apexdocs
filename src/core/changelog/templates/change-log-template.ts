export const changeLogTemplate = `
# Changelog

{{#if newClasses}}
## {{newClasses.heading}}

{{newClasses.description}}

{{#each newClasses.types}}
### {{this.name}}

{{{renderContent this.description}}}
{{/each}}

{{/if}}
`.trim();
