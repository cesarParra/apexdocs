import * as handlebars from 'handlebars';

export function compile(template: string, source: { name: string }) {
  const compiled = handlebars.compile(template);
  return compiled(source);
}
