import { Type, ReflectionResult } from '@cparra/apex-reflection';
import ApexBundle from '../model/apex-bundle';
import MetadataProcessor from './metadata-processor';

export interface TypeParser {
  parse(reflect: (typeBody: string) => ReflectionResult): Type[];
}

export class RawBodyParser implements TypeParser {
  constructor(public typeBundles: ApexBundle[]) {}

  parse(reflect: (typeBody: string) => ReflectionResult): Type[] {
    return this.typeBundles
      .map((currentBundle) => {
        const result = reflect(currentBundle.rawTypeContent);
        if (!!result.typeMirror && !!currentBundle.rawMetadataContent) {
          // If successful and there is a metadata file
          const metadataParams = MetadataProcessor.process(currentBundle.rawMetadataContent);
          metadataParams.forEach((value, key) => {
            const declaration = `${key}: ${value}`;
            result.typeMirror!.annotations.push({
              rawDeclaration: declaration,
              name: declaration,
              type: declaration,
            });
          });
        }
        return result;
      })
      .filter((reflectionResult) => {
        return reflectionResult.typeMirror;
      })
      .map((reflectionResult) => reflectionResult.typeMirror!);
  }
}
