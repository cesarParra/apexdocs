import { MarkdownTranspilerBase } from '../markdown-transpiler-base';
import { LinkingStrategy } from '../../processor-type-transpiler';
import { Type } from '@cparra/apex-reflection';
import { OutputFile } from '../../../model/outputFile';
import { Settings } from '../../../settings';
import ClassFileGeneratorHelper from '../class-file-generatorHelper';
import { MarkdownHomeFile } from '../../../model/markdown-home-file';
import { documentType } from '../../../core/generate-docs';

export class PlainMarkdownDocsProcessor extends MarkdownTranspilerBase {
  onBeforeProcess = (types: Type[]) => {
    this._fileContainer.pushFile(new MarkdownHomeFile(this.homeFileName(), types));
  };

  homeFileName(): string {
    return 'index';
  }

  getLinkingStrategy(): LinkingStrategy {
    return 'path-relative';
  }

  onProcess(type: Type): void {
    this._fileContainer.pushFile(new GenericFile(type));
  }
}

class GenericFile extends OutputFile {
  constructor(private type: Type) {
    super(
      `${Settings.getInstance().getNamespacePrefix()}${type.name}`,
      ClassFileGeneratorHelper.getSanitizedGroup(type),
    );

    this.addText(documentType(type, Settings.getInstance().getNamespace()));
  }

  fileExtension(): string {
    return '.md';
  }
}
