import { EnumMirror } from '@cparra/apex-reflection';
import { EnumSource } from '../templating/types';
import { linkFromTypeNameGenerator } from './references';
import {
  documentationLinesToRenderableContent,
  extractAnnotationBody,
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
      description: documentationLinesToRenderableContent(value.docComment?.descriptionLines),
    })),
    description: documentationLinesToRenderableContent(enumType.docComment?.descriptionLines),
    group: extractAnnotationBody(enumType, 'group'),
    author: extractAnnotationBody(enumType, 'author'),
    date: extractAnnotationBody(enumType, 'date'),
    customTags: extractCustomTags(enumType),
    sees: extractSeeAnnotations(enumType).map(linkFromTypeNameGenerator),
  };
}
