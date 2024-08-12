import { Type } from '@cparra/apex-reflection';
import { MarkdownGeneratorConfig } from '../generate-docs';
import { StringOrLink } from './types';

export function linkFromTypeNameGenerator(
  typeBeingDocumented: Type,
  repository: Type[],
  referenceName: string,
  config: MarkdownGeneratorConfig,
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

export function findType(repository: Type[], referenceName: string) {
  return repository.find((currentType: Type) => currentType.name.toLowerCase() === referenceName.toLowerCase());
}

function getFileLinkTuple(
  typeBeingDocumented: Type,
  referencedType: Type,
  config: MarkdownGeneratorConfig,
): [string, string] {
  const namespacePrefix = config.namespace ? `${config.namespace}.` : '';
  const directoryRoot = `${getDirectoryRoot(typeBeingDocumented, referencedType, config)}`;
  // TODO: Instead of adding a "." to the name when there is a namespace, maybe we want to create a folder for everything
  // within that namespace and put the files in there.
  const fullClassName = `${namespacePrefix}${referencedType.name}`;
  return [fullClassName, `${directoryRoot}${fullClassName}.md`];
}

function getDirectoryRoot(typeBeingDocumented: Type, referencedType: Type, config: MarkdownGeneratorConfig) {
  if (getTypeGroup(typeBeingDocumented, config) === getTypeGroup(referencedType, config)) {
    // If the types the same groups then we simply link directly to that file
    return './';
  } else {
    // If the types have different groups, then we have to go up a directory
    return `../${getSanitizedGroup(referencedType, config)}/`;
  }
}

export function getSanitizedGroup(classModel: Type, config: MarkdownGeneratorConfig) {
  return getTypeGroup(classModel, config).replace(/ /g, '-').replace('.', '');
}

export function getTypeGroup(type: Type, config: MarkdownGeneratorConfig): string {
  const groupAnnotation = type.docComment?.annotations.find((annotation) => annotation.name.toLowerCase() === 'group');
  return groupAnnotation?.body ?? config.defaultGroupName;
}
