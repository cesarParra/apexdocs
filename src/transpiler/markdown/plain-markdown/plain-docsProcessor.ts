import { MarkdownTranspilerBase } from '../markdown-transpiler-base';
import { LinkingStrategy } from '../../processor-type-transpiler';
import { ClassMirror, EnumMirror, InterfaceMirror, Type } from '@cparra/apex-reflection';
import { OutputFile } from '../../../model/outputFile';
import { Settings } from '../../../settings';
import ClassFileGeneratorHelper from '../class-file-generatorHelper';
import { enumMarkdownTemplate } from './enum-template';
import { compile } from '../../../templating/compile';
import {
  RenderableClass,
  RenderableEnum,
  RenderableInterface,
  Link,
  RenderableContent,
  StringOrLink,
} from '../../../templating/types';
import { interfaceMarkdownTemplate } from './interface-template';
import { classMarkdownTemplate } from './class-template';
import { isEmptyLine } from '../../../adapters/type-utils';
import {
  classTypeToClassSource,
  enumTypeToEnumSource,
  interfaceTypeToInterfaceSource,
} from '../../../adapters/apex-types';
import { MarkdownHomeFile } from '../../../model/markdown-home-file';
import { MarkdownFile } from '../../../model/markdown-file';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

export class PlainMarkdownDocsProcessor extends MarkdownTranspilerBase {
  _fileContents: string[] = [];
  onBeforeProcess = (types: Type[]) => {
    if (Settings.getInstance().shouldOutputSingleFile()) {
      return;
    } else {
      this._fileContainer.pushFile(new MarkdownHomeFile(this.homeFileName(), types));
    }
  };

  homeFileName(): string {
    return 'index';
  }

  getLinkingStrategy(): LinkingStrategy {
    return 'path-relative';
  }

  onProcess(type: Type): void {
    if (Settings.getInstance().shouldOutputSingleFile()) {
      this._fileContents.push(this._generateOutputFile(type).body);
    } else {
      this._fileContainer.pushFile(this._generateOutputFile(type));
    }
  }

  onAfterProcess: (types: Type[]) => void = () => {
    if (Settings.getInstance().shouldOutputSingleFile()) {
      const file = new MarkdownFile(Settings.getInstance().getSingleFileName(), '');

      let contents;
      if (Settings.getInstance().getTemplateFilePath()) {
        const filePath = path.resolve(Settings.getInstance().getTemplateFilePath()!);
        const templateFileContents = fs.readFileSync(filePath, {
          encoding: 'utf-8',
        });
        const handlebars = Handlebars.compile(templateFileContents);
        contents = handlebars({ api_docs: this._fileContents.join('\n\n---\n\n') });
      } else {
        contents = this._fileContents.join('\n\n---\n\n');
      }
      file.addText(contents);
      this._fileContainer.pushFile(file);
    }
  };

  _generateOutputFile(type: Type): OutputFile {
    if (type.type_name === 'enum') {
      return new GenericFile<EnumMirror>(type as EnumMirror, enumTypeToEnumSource, enumMarkdownTemplate);
    } else if (type.type_name === 'interface') {
      return new GenericFile<InterfaceMirror>(
        type as InterfaceMirror,
        interfaceTypeToInterfaceSource,
        interfaceMarkdownTemplate,
      );
    } else {
      return new GenericFile<ClassMirror>(type as ClassMirror, classTypeToClassSource, classMarkdownTemplate);
    }
  }
}

class GenericFile<T extends Type> extends OutputFile {
  constructor(
    private type: T,
    toSource: (type: T) => RenderableEnum | RenderableInterface | RenderableClass,
    template: string,
  ) {
    super(
      `${Settings.getInstance().getNamespacePrefix()}${type.name}`,
      ClassFileGeneratorHelper.getSanitizedGroup(type),
    );

    const source = toSource(type);
    const contents = compile(template, source, {
      renderableContentConverter: prepareDescription,
      link: link,
      codeBlockConverter: convertCodeBlock,
    });
    this.addText(contents);
  }

  fileExtension(): string {
    return '.md';
  }
}

function link(source: StringOrLink): string {
  if (typeof source === 'string') {
    return source;
  } else {
    return `[${source.title}](${source.url})`;
  }
}

function prepareDescription(description?: RenderableContent[]) {
  if (!description) {
    return '';
  }

  function reduceDescription(acc: string, curr: RenderableContent) {
    if (typeof curr === 'string') {
      return acc + curr.trim() + ' ';
    } else if (isEmptyLine(curr)) {
      return acc + '\n\n';
    } else {
      return acc + linkToMarkdown(curr) + ' ';
    }
  }

  function linkToMarkdown(link: Link) {
    return `[${link.title}](${link.url})`;
  }

  return description.reduce(reduceDescription, '').trim();
}

function convertCodeBlock(language: string, lines: string[]): Handlebars.SafeString {
  console.log('lines', lines);
  return new Handlebars.SafeString(
    `
\`\`\`${language}
${lines.join('\n')}
\`\`\`
  `.trim(),
  );
}
