import Manifest from '../manifest';
import { ParsedFile } from '../shared/types';

export function filterScope(scopes: string[], parsedFiles: ParsedFile[]): ParsedFile[] {
  return parsedFiles
    .filter(({ type }) => Manifest.shouldFilterType(type, scopes))
    .map((parsedFile) => {
      return {
        ...parsedFile,
        type: Manifest.filterSingleType(parsedFile.type, scopes, false),
      };
    });
}
