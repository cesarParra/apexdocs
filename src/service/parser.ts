import { Type, ReflectionResult } from '@cparra/apex-reflection';

export interface TypeParser {
  parse(reflect: (typeBody: string) => ReflectionResult): Type[];
}

export class RawBodyParser implements TypeParser {
  constructor(public typeBodies: string[]) {}

  parse(reflect: (typeBody: string) => ReflectionResult): Type[] {
    return this.typeBodies
      .map(rawBody => reflect(rawBody))
      .filter(reflectionResult => {
        return reflectionResult.typeMirror;
      })
      .map(reflectionResult => reflectionResult.typeMirror!);
  }
}
