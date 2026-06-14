import { reflect, Type } from '@cparra/apex-reflection';
import { ParsedFile } from '../../../shared/types';

export async function parsedFileFromRawString(raw: string): Promise<ParsedFile<Type>> {
  const { error, typeMirror } = await reflect(raw);
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
