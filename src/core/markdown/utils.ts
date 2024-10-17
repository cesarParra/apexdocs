import { ParsedFile } from '../shared/types';
import { Type } from '@cparra/apex-reflection';

export const parsedFilesToTypes = <T extends Type>(parsedFiles: ParsedFile<T>[]) =>
  parsedFiles.map((parsedFile) => parsedFile.type);
