import { EnumMirror } from '@cparra/apex-reflection';
import { EnumSource, RenderableContent } from '../templating/types';
import { linkFromTypeNameGenerator, replaceInlineReferences } from './references';

export function enumTypeToEnumSource(enumType: EnumMirror): EnumSource {
  return {
    name: enumType.name,
    values: [],
    description: enumType.docComment?.descriptionLines
      ? enumType.docComment.descriptionLines
          .map<RenderableContent[]>((line) => [
            ...replaceInlineReferences(line),
            {
              type: 'empty-line',
            },
          ])
          .flatMap((line) => line)
      : [],
    group: extractAnnotation(enumType, 'group'),
    author: extractAnnotation(enumType, 'author'),
    date: extractAnnotation(enumType, 'date'),
    customTags: extractCustomTags(enumType),
    sees: extractSeeAnnotations(enumType).map(linkFromTypeNameGenerator),
  };
}

function extractAnnotation(enumType: EnumMirror, annotationName: string): string | undefined {
  return enumType.docComment?.annotations.find(
    (currentAnnotation) => currentAnnotation.name.toLowerCase() === annotationName,
  )?.body;
}

function extractSeeAnnotations(enumType: EnumMirror): string[] {
  return (
    enumType.docComment?.annotations
      .filter((currentAnnotation) => currentAnnotation.name.toLowerCase() === 'see')
      .map((currentAnnotation) => currentAnnotation.body) ?? []
  );
}

const baseTags = ['description', 'group', 'author', 'date', 'see'];

function extractCustomTags(enumType: EnumMirror): { name: string; value: string }[] {
  return (
    enumType.docComment?.annotations
      .filter((currentAnnotation) => !baseTags.includes(currentAnnotation.name.toLowerCase()))
      .map((currentAnnotation) => ({
        name: currentAnnotation.name,
        value: currentAnnotation.body,
      })) ?? []
  );
}
