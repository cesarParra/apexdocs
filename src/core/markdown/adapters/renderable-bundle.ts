import { DocPageReference, ParsedFile } from '../../shared/types';
import { Link, RenderableBundle, StringOrLink } from './types';
import { typeToRenderable } from './apex-types';
import { adaptDescribable } from './documentables';
import { Type } from '@cparra/apex-reflection';
import { MarkdownGeneratorConfig } from '../generate-docs';
import { findType, getSanitizedGroup, getTypeGroup, linkFromTypeNameGenerator } from './link-generator';

export function parsedFilesToRenderableBundle(
  config: MarkdownGeneratorConfig,
  parsedFiles: ParsedFile[],
  references: Record<string, DocPageReference>,
): RenderableBundle {
  return parsedFiles.reduce<RenderableBundle>(
    (acc, parsedFile) => {
      const renderable = typeToRenderable(
        parsedFile,
        (referenceName) => {
          return linkFromTypeNameGenerator(
            parsedFile.type,
            parsedFiles.map((file) => file.type),
            referenceName,
            config,
          );
        },
        config,
      );
      acc.renderables.push(renderable);

      const descriptionLines = parsedFile.type.docComment?.descriptionLines;
      const reference = {
        typeName: parsedFile.type.name,
        directory: getDirectoryFromRoot(config, parsedFile.type),
        title: getLinkFromRoot(config, parsedFile.type),
        description: adaptDescribable(descriptionLines, (referenceName) =>
          getPossibleLinkFromRoot(
            config,
            referenceName,
            findType(
              parsedFiles.map((file) => file.type),
              referenceName,
            ),
          ),
        ).description,
      };

      const group = getTypeGroup(parsedFile.type, config);
      if (!acc.references[group]) {
        acc.references[group] = [];
      }
      acc.references[group].push(reference);

      return acc;
    },
    {
      references: {},
      renderables: [],
    },
  );
}

function getPossibleLinkFromRoot(config: MarkdownGeneratorConfig, fallback: string, type?: Type): StringOrLink {
  if (!type) {
    return fallback;
  }
  const namespacePrefix = config.namespace ? `${config.namespace}.` : '';
  const title = `${namespacePrefix}${type.name}`;
  return {
    __type: 'link',
    title: title,
    url: `${getDirectoryFromRoot(config, type)}/${title}.md`,
  };
}

function getDirectoryFromRoot(config: MarkdownGeneratorConfig, type?: Type): string {
  if (!type) {
    return '';
  }
  return `./${getSanitizedGroup(type, config)}`;
}

function getLinkFromRoot(config: MarkdownGeneratorConfig, type: Type): Link {
  const namespacePrefix = config.namespace ? `${config.namespace}.` : '';
  const title = `${namespacePrefix}${type.name}`;
  return {
    __type: 'link',
    title: title,
    url: `${getDirectoryFromRoot(config, type)}/${title}.md`,
  };
}
