import { Type } from '@cparra/apex-reflection';
import { FileContainer } from './openapi/file-container';

// TODO: Is this still being used?
export default abstract class ProcessorTypeTranspiler {
  onBeforeProcess: ((types: Type[]) => void) | undefined;

  abstract onProcess(type: Type): void;

  onAfterProcess: ((types: Type[]) => void) | undefined;

  abstract fileBuilder(): FileContainer;
}
