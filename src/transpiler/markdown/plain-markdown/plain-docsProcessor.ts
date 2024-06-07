import { MarkdownTranspilerBase } from '../markdown-transpiler-base';
import { LinkingStrategy } from '../../processor-type-transpiler';
import { EnumMirror, Type } from '@cparra/apex-reflection';
import { OutputFile } from '../../../model/outputFile';
import { Settings } from '../../../settings';
import ClassFileGeneratorHelper from '../class-file-generatorHelper';
import { enumMarkdownTemplate } from './enum-template';
import { compile } from '../../../templating/compile';
import { EnumSource, Link, RenderableContent } from '../../../templating/types';
import { MarkdownTypeFile } from '../../../model/markdown-type-file';
import { linkFromTypeNameGenerator, replaceInlineReferences } from '../../../mirror-to-template-adapter/references';

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

// TODO: Unit test the Enum use case
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

function prepareDescription(description?: RenderableContent[]) {
  if (!description) {
    return '';
  }

  function reduceDescription(acc: string, curr: RenderableContent) {
    if (typeof curr === 'string') {
      return acc + curr;
    } else {
      return acc + linkToMarkdown(curr);
    }
  }

  function linkToMarkdown(link: Link) {
    return `[${link.title}](${link.url})`;
  }

  return description.reduce(reduceDescription, '');
}

// TODO: Move to the mirror-to-template-adapter directory
function enumTypeToEnumSource(enumType: EnumMirror): EnumSource {
  return {
    name: enumType.name,
    // TODO: Today, enum mirror does not provide this, we want it.
    values: [],
    description: enumType.docComment?.descriptionLines
      ? enumType.docComment.descriptionLines
          .map((line) => [...replaceInlineReferences(line), '\n\n'])
          .flatMap((line) => line)
      : [],
    group: extractAnnotation(enumType, 'group'),
    author: extractAnnotation(enumType, 'author'),
    date: extractAnnotation(enumType, 'date'),
    customTags: extractCustomTags(enumType),
    sees: extractSeeAnnotations(enumType).map(linkFromTypeNameGenerator),
  };
}

function extractAnnotation(enumType: EnumMirror, annotationName: string): string | undefined {
  return enumType.docComment?.annotations.find(
    (currentAnnotation) => currentAnnotation.name.toLowerCase() === annotationName,
  )?.body;
}

function extractSeeAnnotations(enumType: EnumMirror): string[] {
  return (
    enumType.docComment?.annotations
      .filter((currentAnnotation) => currentAnnotation.name.toLowerCase() === 'see')
      .map((currentAnnotation) => currentAnnotation.body) ?? []
  );
}

const baseTags = ['description', 'group', 'author', 'date', 'see'];

function extractCustomTags(enumType: EnumMirror): { name: string; value: string }[] {
  return (
    enumType.docComment?.annotations
      .filter((currentAnnotation) => !baseTags.includes(currentAnnotation.name.toLowerCase()))
      .map((currentAnnotation) => ({
        name: currentAnnotation.name,
        value: currentAnnotation.body,
      })) ?? []
  );
}
