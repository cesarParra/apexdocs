import { ClassMirror, Type } from '@cparra/apex-reflection';
import { createInheritanceChain } from './inheritance-chain';
import { parsedFilesToTypes } from '../markdown/utils';
import { ParsedFile } from '../shared/types';

export const addInheritanceChainToTypes = (parsedFiles: ParsedFile[]): ParsedFile[] =>
  parsedFiles.map((parsedFile) => ({
    ...parsedFile,
    type: addInheritanceChain(parsedFile.type, parsedFilesToTypes(parsedFiles)),
  }));

function addInheritanceChain<T extends Type>(current: T, repository: Type[]): T {
  if (current.type_name === 'enum' || current.type_name === 'interface') {
    return current;
  } else {
    const inheritanceChain = createInheritanceChain(repository, current as ClassMirror);
    return {
      ...current,
      inheritanceChain,
    };
  }
}
