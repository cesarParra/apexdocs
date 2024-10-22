import { MarkdownGeneratorConfig } from '../generate-docs';
import { DocPageReference, ParsedFile } from '../../shared/types';
import { getTypeGroup } from '../../shared/utils';
import { CustomObjectMetadata } from '../../reflection/sobject/reflect-custom-object-sources';
import { Type } from '@cparra/apex-reflection';

export function parsedFilesToReferenceGuide(
  config: MarkdownGeneratorConfig,
  parsedFiles: ParsedFile<Type | CustomObjectMetadata>[],
): Record<string, DocPageReference> {
  return parsedFiles.reduce<Record<string, DocPageReference>>((acc, parsedFile) => {
    acc[parsedFile.source.name] = parsedFileToDocPageReference(config, parsedFile);
    return acc;
  }, {});
}

function parsedFileToDocPageReference(
  config: MarkdownGeneratorConfig,
  parsedFile: ParsedFile<Type | CustomObjectMetadata>,
): DocPageReference {
  const path = `${slugify(getTypeGroup(parsedFile.type, config))}/${parsedFile.source.name}.md`;
  return {
    source: parsedFile.source,
    displayName: parsedFile.source.name,
    outputDocPath: path,
    referencePath: path,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen
}
