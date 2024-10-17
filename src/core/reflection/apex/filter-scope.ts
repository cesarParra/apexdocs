import Manifest from '../../manifest';
import { ParsedFile } from '../../shared/types';
import { Type } from '@cparra/apex-reflection';

export function filterScope(scopes: string[], parsedFiles: ParsedFile<Type>[]): ParsedFile<Type>[] {
  return parsedFiles
    .filter(({ type }) => Manifest.shouldFilterType(type, scopes))
    .map((parsedFile) => {
      return {
        ...parsedFile,
        type: Manifest.filterSingleType(parsedFile.type, scopes, false),
      };
    });
}
