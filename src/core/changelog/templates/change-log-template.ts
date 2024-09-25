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

{{#if newInterfaces}}
## {{newInterfaces.heading}}

{{newInterfaces.description}}

{{#each newInterfaces.types}}
### {{this.name}}

{{{renderContent this.description}}}
{{/each}}
{{/if}}

{{#if newEnums}}
## {{newEnums.heading}}

{{newEnums.description}}

{{#each newEnums.types}}
### {{this.name}}

{{{renderContent this.description}}}
{{/each}}
{{/if}}
`.trim();
