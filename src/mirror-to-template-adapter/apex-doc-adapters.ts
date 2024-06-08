import { DocComment, EnumMirror, Type } from '@cparra/apex-reflection';
import { RenderableContent } from '../templating/types';
import { replaceInlineReferences } from './references';

export function docCommentDescriptionToRenderableContent(
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

export function extractAnnotation(type: Type, annotationName: string): string | undefined {
  return type.docComment?.annotations.find(
    (currentAnnotation) => currentAnnotation.name.toLowerCase() === annotationName,
  )?.body;
}

export function extractSeeAnnotations(type: Type): string[] {
  return (
    type.docComment?.annotations
      .filter((currentAnnotation) => currentAnnotation.name.toLowerCase() === 'see')
      .map((currentAnnotation) => currentAnnotation.body) ?? []
  );
}

const baseTags = ['description', 'group', 'author', 'date', 'see'];

export function extractCustomTags(type: Type): { name: string; value: string }[] {
  return (
    type.docComment?.annotations
      .filter((currentAnnotation) => !baseTags.includes(currentAnnotation.name.toLowerCase()))
      .map((currentAnnotation) => ({
        name: currentAnnotation.name,
        value: currentAnnotation.body,
      })) ?? []
  );
}
