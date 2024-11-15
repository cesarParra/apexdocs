import { ExternalMetadata, Frontmatter, Skip, SourceFileMetadata } from './types';
import { Type } from '@cparra/apex-reflection';
import { CustomObjectMetadata } from '../reflection/sobject/reflect-custom-object-sources';
import { MarkdownGeneratorConfig } from '../markdown/generate-docs';
import { CustomFieldMetadata } from '../reflection/sobject/reflect-custom-field-source';
import yaml from 'js-yaml';

/**
 * Represents a file to be skipped.
 */
export function skip(): Skip {
  return {
    _tag: 'Skip',
  };
}

export function isSkip(value: unknown): value is Skip {
  return Object.prototype.hasOwnProperty.call(value, '_tag') && (value as Skip)._tag === 'Skip';
}

export function isObjectType(type: Type | CustomObjectMetadata | CustomFieldMetadata): type is CustomObjectMetadata {
  return (type as CustomObjectMetadata).type_name === 'customobject';
}

export function isApexType(type: Type | CustomObjectMetadata | CustomFieldMetadata): type is Type {
  return !isObjectType(type);
}

export function isInSource(source: SourceFileMetadata | ExternalMetadata): source is SourceFileMetadata {
  return 'filePath' in source;
}

export function getTypeGroup(type: Type | CustomObjectMetadata, config: MarkdownGeneratorConfig): string {
  function getGroup(type: Type, config: MarkdownGeneratorConfig): string {
    const groupAnnotation = type.docComment?.annotations.find(
      (annotation) => annotation.name.toLowerCase() === 'group',
    );
    return groupAnnotation?.body ?? config.defaultGroupName;
  }

  switch (type.type_name) {
    case 'customobject':
      return config.customObjectsGroupName;
    default:
      return getGroup(type, config);
  }
}

export function passThroughHook<T>(value: T): T {
  return value;
}

export function toFrontmatterString(frontmatter: Frontmatter): string {
  if (typeof frontmatter === 'string') {
    return frontmatter;
  }

  if (!frontmatter) {
    return '';
  }

  const yamlString = yaml.dump(frontmatter);
  return `---\n${yamlString}---\n`;
}
