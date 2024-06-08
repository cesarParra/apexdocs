import { DocComment, EnumMirror } from '@cparra/apex-reflection';
import { EnumSource, RenderableContent } from '../templating/types';
import { linkFromTypeNameGenerator, replaceInlineReferences } from './references';

export function enumTypeToEnumSource(enumType: EnumMirror): EnumSource {
  return {
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

function docCommentDescriptionToRenderableContent(
  description: DocComment | undefined,
): RenderableContent[] | undefined {
  return description?.descriptionLines
    ? description.descriptionLines
        .map<RenderableContent[]>((line) => [
          ...replaceInlineReferences(line),
          {
            type: 'empty-line',
          },
        ])
        .flatMap((line) => line)
    : undefined;
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
