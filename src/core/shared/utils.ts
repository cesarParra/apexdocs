import { ExternalMetadata, Frontmatter, ParsedType, Skip, SourceFileMetadata, TopLevelType } from './types';
import { Type } from '@cparra/apex-reflection';
import { CustomObjectMetadata } from '../reflection/sobject/reflect-custom-object-sources';
import { MarkdownGeneratorConfig } from '../markdown/generate-docs';
import yaml from 'js-yaml';
import { TriggerMetadata } from '../reflection/trigger/reflect-trigger-source';
import { LwcMetadata } from '../reflection/lwc/reflect-lwc-source';

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

export function isObjectType(type: ParsedType): type is CustomObjectMetadata {
  return (type as CustomObjectMetadata).type_name === 'customobject';
}

export function isApexType(type: ParsedType): type is Type {
  return !isObjectType(type) && !isTriggerType(type) && !isLwcType(type);
}

function isTriggerType(type: ParsedType): type is TriggerMetadata {
  return type.type_name === 'trigger';
}

export function isLwcType(type: ParsedType): type is LwcMetadata {
  return type.type_name === 'lwc';
}

export function isInSource(source: SourceFileMetadata | ExternalMetadata): source is SourceFileMetadata {
  return 'filePath' in source;
}

export function getTypeGroup(type: TopLevelType, config: MarkdownGeneratorConfig): string {
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
    case 'lwc':
      return config.lwcGroupName;
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
