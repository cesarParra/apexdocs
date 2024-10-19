export const customObjectTemplate = `
{{ heading headingLevel heading }}

{{{renderContent doc.description}}}

## API Name
\`{{apiName}}\`

{{#if hasFields}}
{{ heading fields.headingLevel fields.heading }}
<table>
<tbody>
  <tr>
    <th>Field</th>
    <th>API Name</th>
    <th>Details</th>
  </tr>
  {{#each fields.value}}
  <tr>
   <td>{{label}}</td>
   <td><code>{{{apiName}}}</code></td>
    <td>{{{renderContent description}}}</td>
  </tr>
  {{/each}}
</tbody>
</table>

{{/if}}

`.trim();
