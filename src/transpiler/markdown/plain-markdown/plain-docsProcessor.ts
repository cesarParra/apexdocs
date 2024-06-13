import { MarkdownTranspilerBase } from '../markdown-transpiler-base';
import { LinkingStrategy } from '../../processor-type-transpiler';
import { EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { OutputFile } from '../../../model/outputFile';
import { Settings } from '../../../settings';
import ClassFileGeneratorHelper from '../class-file-generatorHelper';
import { enumMarkdownTemplate } from './enum-template';
import { compile } from '../../../templating/compile';
import { EnumSource, InterfaceSource, Link, RenderableContent } from '../../../templating/types';
import { MarkdownTypeFile } from '../../../model/markdown-type-file';
import { enumTypeToEnumSource } from '../../../mirror-to-template-adapter/enum-adapter';
import { interfaceTypeToInterfaceSource } from '../../../mirror-to-template-adapter/interface-adapter';
import { interfaceMarkdownTemplate } from './interface-template';
import { isEmptyLine } from '../../../mirror-to-template-adapter/apex-doc-adapters';

export class PlainMarkdownDocsProcessor extends MarkdownTranspilerBase {
  homeFileName(): string {
    return 'index';
  }

  getLinkingStrategy(): LinkingStrategy {
    return 'path-relative';
  }

  onProcess(type: Type): void {
    if (type.type_name === 'enum') {
      this._fileContainer.pushFile(
        new GenericFile<EnumMirror>(type as EnumMirror, enumTypeToEnumSource, enumMarkdownTemplate),
      );
    } else if (type.type_name === 'interface') {
      this._fileContainer.pushFile(
        new GenericFile<InterfaceMirror>(
          type as InterfaceMirror,
          interfaceTypeToInterfaceSource,
          interfaceMarkdownTemplate,
        ),
      );
    } else {
      this._fileContainer.pushFile(new MarkdownTypeFile(type));
    }
  }
}

class GenericFile<T extends Type> extends OutputFile {
  constructor(private type: T, toSource: (type: T) => EnumSource | InterfaceSource, template: string) {
    super(
      `${Settings.getInstance().getNamespacePrefix()}${type.name}`,
      ClassFileGeneratorHelper.getSanitizedGroup(type),
    );

    const source = toSource(type);
    this.addText(
      compile(template, source, {
        renderableContentConverter: prepareDescription,
        codeBlockConverter: convertCodeBlock,
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

  function linkToMarkdown(link: Link) {
    return `[${link.title}](${link.url})`;
  }

  return description.reduce(reduceDescription, '');
}

function convertCodeBlock(language: string, lines: string[]): string {
  return `
\`\`\`${language}
${lines.join('\n')}
\`\`\`
  `.trim();
}
