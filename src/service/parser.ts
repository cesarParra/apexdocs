import { Type, ReflectionResult } from '@cparra/apex-reflection';
import { Logger } from '../util/logger';

export interface TypeParser {
  parse(reflect: (typeBody: string) => ReflectionResult): Type[];
}

export class RawBodyParser implements TypeParser {
  constructor(public typeBodies: string[]) {
  }

  parse(reflect: (typeBody: string) => ReflectionResult): Type[] {
    return this.typeBodies
      .map(rawBody => reflect(rawBody))
      .filter(reflectionResult => {
        if (!reflectionResult.typeMirror) {
          return false;
        }
        return true;
      })
      .map(reflectionResult => reflectionResult.typeMirror!);
  }
}
