import { Skip } from './types';
import { Type } from '@cparra/apex-reflection';
import { ObjectMetadata } from '../reflection/sobject/reflect-sobject-source';
import { MarkdownGeneratorConfig } from '../markdown/generate-docs';
import { CustomFieldMetadata } from '../reflection/sobject/reflect-custom-field-source';

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

export function isObjectType(type: Type | ObjectMetadata | CustomFieldMetadata): type is ObjectMetadata {
  return (type as ObjectMetadata).type_name === 'customobject';
}

export function isApexType(type: Type | ObjectMetadata | CustomFieldMetadata): type is Type {
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
    case 'customobject':
      return config.customObjectsGroupName;
    default:
      return getGroup(type, config);
  }
}
