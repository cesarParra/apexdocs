import { Skip } from './types';
import { Type } from '@cparra/apex-reflection';
import { ObjectMetadata } from '../reflection/reflect-object-source';
import { MarkdownGeneratorConfig } from '../markdown/generate-docs';

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

export function isObjectType(type: Type | ObjectMetadata): type is ObjectMetadata {
  return (type as ObjectMetadata).type_name === 'object';
}

export function isApexType(type: Type | ObjectMetadata): type is Type {
  return !isObjectType(type);
}

export function getTypeGroup(type: Type | ObjectMetadata, config: MarkdownGeneratorConfig): string {
  function getGroup(type: Type, config: MarkdownGeneratorConfig): string {
    const groupAnnotation = type.docComment?.annotations.find(
      (annotation) => annotation.name.toLowerCase() === 'group',
    );
    return groupAnnotation?.body ?? config.defaultGroupName;
  }

  switch (type.type_name) {
    case 'object':
      return 'Objects'; // TODO: Make configurable?
    default:
      return getGroup(type, config);
  }
}
