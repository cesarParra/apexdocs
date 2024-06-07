import { MarkdownTranspilerBase } from '../markdown-transpiler-base';
import { LinkingStrategy } from '../../processor-type-transpiler';
import { EnumMirror, Type } from '@cparra/apex-reflection';
import { OutputFile } from '../../../model/outputFile';
import { Settings } from '../../../settings';
import ClassFileGeneratorHelper from '../class-file-generatorHelper';
import { enumMarkdownTemplate } from './enum-template';
import { compile } from '../../../templating/compile';
import { EnumSource } from '../../../templating/types';
import { MarkdownTypeFile } from '../../../model/markdown-type-file';
import { replaceInlineReferences } from '../../../mirror-to-template-adapter/references';

export class PlainMarkdownDocsProcessor extends MarkdownTranspilerBase {
  homeFileName(): string {
    return 'index';
  }

  getLinkingStrategy(): LinkingStrategy {
    return 'path-relative';
  }

  onProcess(type: Type): void {
    if (type.type_name === 'enum') {
      this._fileContainer.pushFile(new EnumFile(type as EnumMirror));
    } else {
      this._fileContainer.pushFile(new MarkdownTypeFile(type));
    }
  }
}

class EnumFile extends OutputFile {
  constructor(private type: EnumMirror) {
    super(
      `${Settings.getInstance().getNamespacePrefix()}${type.name}`,
      ClassFileGeneratorHelper.getSanitizedGroup(type),
    );

    const enumSource = enumTypeToEnumSource(type);
    this.addText(compile(enumMarkdownTemplate, enumSource));
  }

  fileExtension(): string {
    return '.md';
  }
}

// TODO: Move to the mirror-to-template-adapter directory
function enumTypeToEnumSource(enumType: EnumMirror): EnumSource {
  return {
    name: enumType.name,
    // TODO: Today, enum mirror does not provide this, we want it.
    values: [],
    description: enumType.docComment?.description ? replaceInlineReferences(enumType.docComment.description) : [],
  };
}
