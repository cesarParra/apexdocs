import { DocumentationConfig, ParsedFile } from '../../shared/types';
import { Link, RenderableBundle, StringOrLink } from './types';
import { typeToRenderable } from './apex-types';
import { adaptDescribable } from './documentables';
import { Type } from '@cparra/apex-reflection';

export function parsedFilesToRenderableBundle(
  config: DocumentationConfig,
  parsedFiles: ParsedFile[],
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
        config.namespace,
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

function linkFromTypeNameGenerator(
  typeBeingDocumented: Type,
  repository: Type[],
  referenceName: string,
  config: DocumentationConfig,
): StringOrLink {
  const type = findType(repository, referenceName);
  if (!type) {
    // If the type is not found, we return the type name as a string.
    return referenceName;
  }

  const [fullClassName, fileLink] = getFileLinkTuple(typeBeingDocumented, type, config);
  return {
    __type: 'link',
    title: fullClassName,
    url: fileLink,
  };
}

function getPossibleLinkFromRoot(config: DocumentationConfig, fallback: string, type?: Type): StringOrLink {
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

function getDirectoryFromRoot(config: DocumentationConfig, type?: Type): string {
  if (!type) {
    return '';
  }
  return `./${getSanitizedGroup(type, config)}`;
}

function findType(repository: Type[], referenceName: string) {
  return repository.find((currentType: Type) => currentType.name.toLowerCase() === referenceName.toLowerCase());
}

function getFileLinkTuple(
  typeBeingDocumented: Type,
  referencedType: Type,
  config: DocumentationConfig,
): [string, string] {
  const namespacePrefix = config.namespace ? `${config.namespace}.` : '';
  const directoryRoot = `${getDirectoryRoot(typeBeingDocumented, referencedType, config)}`;
  // TODO: Instead of adding a "." to the name when there is a namespace, maybe we want to create a folder for everything
  // within that namespace and put the files in there.
  const fullClassName = `${namespacePrefix}${referencedType.name}`;
  return [fullClassName, `${directoryRoot}${fullClassName}.md`];
}

function getDirectoryRoot(typeBeingDocumented: Type, referencedType: Type, config: DocumentationConfig) {
  if (getTypeGroup(typeBeingDocumented, config) === getTypeGroup(referencedType, config)) {
    // If the types the same groups then we simply link directly to that file
    return './';
  } else {
    // If the types have different groups, then we have to go up a directory
    return `../${getSanitizedGroup(referencedType, config)}/`;
  }
}

function getTypeGroup(type: Type, config: DocumentationConfig): string {
  const groupAnnotation = type.docComment?.annotations.find((annotation) => annotation.name.toLowerCase() === 'group');
  return groupAnnotation?.body ?? config.defaultGroupName;
}

function getSanitizedGroup(classModel: Type, config: DocumentationConfig) {
  return getTypeGroup(classModel, config).replace(/ /g, '-').replace('.', '');
}

function getLinkFromRoot(config: DocumentationConfig, type: Type): Link {
  const namespacePrefix = config.namespace ? `${config.namespace}.` : '';
  const title = `${namespacePrefix}${type.name}`;
  return {
    __type: 'link',
    title: title,
    url: `${getDirectoryFromRoot(config, type)}/${title}.md`,
  };
}
