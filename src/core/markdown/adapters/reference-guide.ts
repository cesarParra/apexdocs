import { MarkdownGeneratorConfig } from '../generate-docs';
import { DocPageReference, ParsedFile } from '../../shared/types';
import { Type } from '@cparra/apex-reflection';

export function parsedFilesToReferenceGuide(
  config: MarkdownGeneratorConfig,
  parsedFiles: ParsedFile[],
): Record<string, DocPageReference> {
  return parsedFiles.reduce<Record<string, DocPageReference>>((acc, parsedFile) => {
    acc[parsedFile.type.name] = parsedFileToDocPageReference(config, parsedFile);
    return acc;
  }, {});
}

function parsedFileToDocPageReference(config: MarkdownGeneratorConfig, parsedFile: ParsedFile): DocPageReference {
  const path = `${slugify(getTypeGroup(parsedFile.type, config))}/${parsedFile.type.name}.md`;
  return {
    source: parsedFile.source,
    displayName: parsedFile.type.name,
    outputDocPath: path,
    referencePath: path,
  };
}

function getTypeGroup(type: Type, config: MarkdownGeneratorConfig): string {
  const groupAnnotation = type.docComment?.annotations.find((annotation) => annotation.name.toLowerCase() === 'group');
  return groupAnnotation?.body ?? config.defaultGroupName;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen
}
