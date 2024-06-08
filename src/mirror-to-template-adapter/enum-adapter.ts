import { EnumMirror } from '@cparra/apex-reflection';
import { EnumSource } from '../templating/types';
import { linkFromTypeNameGenerator } from './references';
import {
  docCommentDescriptionToRenderableContent,
  extractAnnotation,
  extractCustomTags,
  extractSeeAnnotations,
} from './apex-doc-adapters';

export function enumTypeToEnumSource(enumType: EnumMirror): EnumSource {
  return {
    __type: 'enum',
    accessModifier: enumType.access_modifier,
    name: enumType.name,
    values: enumType.values.map((value) => ({
      value: value.name,
      description: docCommentDescriptionToRenderableContent(value.docComment),
    })),
    description: docCommentDescriptionToRenderableContent(enumType.docComment),
    group: extractAnnotation(enumType, 'group'),
    author: extractAnnotation(enumType, 'author'),
    date: extractAnnotation(enumType, 'date'),
    customTags: extractCustomTags(enumType),
    sees: extractSeeAnnotations(enumType).map(linkFromTypeNameGenerator),
  };
}
