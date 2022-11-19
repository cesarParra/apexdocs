import { Type } from '@cparra/apex-reflection';
import { FileContainer } from './file-container';

export type LinkingStrategy = 'root-relative' | 'path-relative';

export default abstract class ProcessorTypeTranspiler {
  onBeforeProcess: ((types: Type[]) => void) | undefined;

  abstract onProcess(type: Type): void;

  onAfterProcess: ((types: Type[]) => void) | undefined;

  abstract fileBuilder(): FileContainer;

  getLinkingStrategy(): LinkingStrategy {
    return 'root-relative';
  }
}
