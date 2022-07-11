import ProcessorTypeTranspiler from '../processor-type-transpiler';
import { Type } from '@cparra/apex-reflection';
import { FileContainer } from '../file-container';
import TsDefinitionFile from '../../model/ts-definition-file';

export class TsTypesTranspiler extends ProcessorTypeTranspiler {
  protected readonly _fileContainer: FileContainer;

  constructor() {
    super();
    this._fileContainer = new FileContainer();
  }

  fileBuilder(): FileContainer {
    return this._fileContainer;
  }

  onProcess(type: Type): void {
    if (type.type_name !== 'class') {
      return;
    }
    this._fileContainer.pushFile(new TsDefinitionFile(type));
  }
}
