import { MarkdownGeneratorConfig } from '../generate-docs';
import { DocPageReference, ParsedFile, TopLevelType } from '../../shared/types';
import { getTypeGroup } from '../../shared/utils';

export function parsedFilesToReferenceGuide(
  config: MarkdownGeneratorConfig,
  parsedFiles: ParsedFile<TopLevelType>[],
): Record<string, DocPageReference> {
  return parsedFiles.reduce<Record<string, DocPageReference>>((acc, parsedFile) => {
    acc[parsedFile.source.name] = parsedFileToDocPageReference(config, parsedFile);
    return acc;
  }, {});
}

function parsedFileToDocPageReference(
  config: MarkdownGeneratorConfig,
  parsedFile: ParsedFile<TopLevelType>,
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
