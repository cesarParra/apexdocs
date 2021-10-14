import { reflect, Type } from '@cparra/apex-reflection';
import { Logger } from '../util/logger';

export interface TypeParser {
  parse(): Type[];
}

export class RawBodyParser implements TypeParser {
  constructor(public typeBodies: string[]) {
  }

  parse(): Type[] {
    return this.typeBodies
      .map(rawBody => reflect(rawBody))
      .filter(reflectionResult => {
        if (!reflectionResult.typeMirror) {
          Logger.log(`Parsing error ${reflectionResult.error?.message}`);
          return false;
        }
        return true;
      })
      .map(reflectionResult => reflectionResult.typeMirror!);
  }
}
