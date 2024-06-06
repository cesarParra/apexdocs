import * as handlebars from 'handlebars';
import { EnumSource } from './types';

export function compile(template: string, source: EnumSource) {
  const compiled = handlebars.compile(template);
  return compiled(source);
}
