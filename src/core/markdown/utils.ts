import { ParsedFile } from '../shared/types';

export const parsedFilesToTypes = (parsedFiles: ParsedFile[]) => parsedFiles.map((parsedFile) => parsedFile.type);
