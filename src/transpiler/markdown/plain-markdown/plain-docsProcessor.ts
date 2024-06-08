import { MarkdownTranspilerBase } from '../markdown-transpiler-base';
import { LinkingStrategy } from '../../processor-type-transpiler';
import { EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { OutputFile } from '../../../model/outputFile';
import { Settings } from '../../../settings';
import ClassFileGeneratorHelper from '../class-file-generatorHelper';
import { enumMarkdownTemplate } from './enum-template';
import { compile } from '../../../templating/compile';
import { EmptyLine, Link, RenderableContent } from '../../../templating/types';
import { MarkdownTypeFile } from '../../../model/markdown-type-file';
import { enumTypeToEnumSource } from '../../../mirror-to-template-adapter/enum-adapter';
import { interfaceTypeToInterfaceSource } from '../../../mirror-to-template-adapter/interface-adapter';
import { interfaceMarkdownTemplate } from './interface-template';

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
    } else if (type.type_name === 'interface') {
      this._fileContainer.pushFile(new InterfaceFile(type as InterfaceMirror));
    } else {
      this._fileContainer.pushFile(new MarkdownTypeFile(type));
    }
  }
}

// TODO: These classes should be combined and we can use generics to figure out what to return

class EnumFile extends OutputFile {
  constructor(private type: EnumMirror) {
    super(
      `${Settings.getInstance().getNamespacePrefix()}${type.name}`,
      ClassFileGeneratorHelper.getSanitizedGroup(type),
    );

    const enumSource = enumTypeToEnumSource(type);
    this.addText(
      compile(enumMarkdownTemplate, enumSource, {
        renderableContentConverter: prepareDescription,
      }),
    );
  }

  fileExtension(): string {
    return '.md';
  }
}

class InterfaceFile extends OutputFile {
  constructor(private type: InterfaceMirror) {
    super(
      `${Settings.getInstance().getNamespacePrefix()}${type.name}`,
      ClassFileGeneratorHelper.getSanitizedGroup(type),
    );

    const interfaceSource = interfaceTypeToInterfaceSource(type);
    this.addText(
      compile(interfaceMarkdownTemplate, interfaceSource, {
        renderableContentConverter: prepareDescription,
      }),
    );
  }

  fileExtension(): string {
    return '.md';
  }
}

function prepareDescription(description?: RenderableContent[]) {
  if (!description) {
    return '';
  }

  function reduceDescription(acc: string, curr: RenderableContent) {
    if (typeof curr === 'string') {
      return acc + curr;
    } else if (isEmptyLine(curr)) {
      return acc + '\n\n';
    } else {
      return acc + linkToMarkdown(curr);
    }
  }

  function isEmptyLine(content: RenderableContent): content is EmptyLine {
    return Object.keys(content).includes('type') && (content as { type: string }).type === 'empty-line';
  }

  function linkToMarkdown(link: Link) {
    return `[${link.title}](${link.url})`;
  }

  return description.reduce(reduceDescription, '');
}
