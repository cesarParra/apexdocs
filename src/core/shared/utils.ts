import { ExternalMetadata, Frontmatter, Skip, SourceFileMetadata } from './types';
import { Type } from '@cparra/apex-reflection';
import { CustomObjectMetadata } from '../reflection/sobject/reflect-custom-object-sources';
import { MarkdownGeneratorConfig } from '../markdown/generate-docs';
import { CustomFieldMetadata } from '../reflection/sobject/reflect-custom-field-source';
import yaml from 'js-yaml';
import { TriggerMetadata } from '../reflection/trigger/reflect-trigger-source';

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

export function isObjectType(
  type: Type | CustomObjectMetadata | CustomFieldMetadata | TriggerMetadata,
): type is CustomObjectMetadata {
  return (type as CustomObjectMetadata).type_name === 'customobject';
}

export function isApexType(type: Type | CustomObjectMetadata | CustomFieldMetadata | TriggerMetadata): type is Type {
  return !isObjectType(type) && !isTriggerType(type);
}

function isTriggerType(
  type: Type | CustomObjectMetadata | CustomFieldMetadata | TriggerMetadata,
): type is TriggerMetadata {
  return type.type_name === 'trigger';
}

export function isInSource(source: SourceFileMetadata | ExternalMetadata): source is SourceFileMetadata {
  return 'filePath' in source;
}

export function getTypeGroup(
  type: Type | CustomObjectMetadata | TriggerMetadata,
  config: MarkdownGeneratorConfig,
): string {
  function getGroup(type: Type, config: MarkdownGeneratorConfig): string {
    const groupAnnotation = type.docComment?.annotations.find(
      (annotation) => annotation.name.toLowerCase() === 'group',
    );
    return groupAnnotation?.body ?? config.defaultGroupName;
  }

  switch (type.type_name) {
    case 'customobject':
      return config.customObjectsGroupName;
    case 'trigger':
      return config.triggersGroupName;
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
