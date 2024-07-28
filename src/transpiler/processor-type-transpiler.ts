import { Type } from '@cparra/apex-reflection';
import { FileContainer } from './file-container';

export default abstract class ProcessorTypeTranspiler {
  onBeforeProcess: ((types: Type[]) => void) | undefined;

  abstract onProcess(type: Type): void;

  onAfterProcess: ((types: Type[]) => void) | undefined;

  abstract fileBuilder(): FileContainer;
}
