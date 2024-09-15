import { ParsedFile } from '../../../shared/types';
import { reflect } from '@cparra/apex-reflection';

export function parsedFileFromRawString(raw: string): ParsedFile {
  const { error, typeMirror } = reflect(raw);
  if (error) {
    throw new Error(error.message);
  }

  return {
    source: {
      filePath: 'test.cls',
      name: typeMirror!.name,
      type: typeMirror!.type_name,
    },
    type: typeMirror!,
  };
}
