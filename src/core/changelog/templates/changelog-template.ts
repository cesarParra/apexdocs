export const changelogTemplate = `
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

{{#if removedTypes}}
## Removed Types

{{removedTypes.description}}

{{#each removedTypes.types}}
- {{this}}
{{/each}}
{{/if}}

{{#if newOrModifiedMembers}}
## {{newOrModifiedMembers.heading}}

{{newOrModifiedMembers.description}}

{{#each newOrModifiedMembers.modifications}}
### {{this.typeName}}

{{#each this.modifications}}
- {{this}}
{{/each}}
{{/each}}
{{/if}}
`.trim();
