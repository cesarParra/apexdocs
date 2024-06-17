import { DocComment, Type } from '@cparra/apex-reflection';
import { EmptyLine, RenderableContent } from '../templating/types';
import { replaceInlineReferences } from './references';

type DocCommentsAware = { docComment?: DocComment };

export function documentationLinesToRenderableContent(
  documentationLines: string[] | undefined,
): RenderableContent[] | undefined {
  if (!documentationLines) {
    return;
  }

  return (
    documentationLines
      .map<RenderableContent[]>((line) => [
        ...replaceInlineReferences(line),
        {
          type: 'empty-line',
        },
      ])
      .flatMap((line) => line)
      // If the last element is an empty line, remove it
      .filter((line, index, lines) => !(isEmptyLine(line) && index === lines.length - 1))
  );
}

export function extractAnnotationBody(type: Type, annotationName: string): string | undefined {
  return type.docComment?.annotations.find(
    (currentAnnotation) => currentAnnotation.name.toLowerCase() === annotationName,
  )?.body;
}

export function extractAnnotationBodyLines(type: DocCommentsAware, annotationName: string): string[] | undefined {
  return type.docComment?.annotations.find(
    (currentAnnotation) => currentAnnotation.name.toLowerCase() === annotationName,
  )?.bodyLines;
}

export function extractSeeAnnotations(type: Type): string[] {
  return (
    type.docComment?.annotations
      .filter((currentAnnotation) => currentAnnotation.name.toLowerCase() === 'see')
      .map((currentAnnotation) => currentAnnotation.body) ?? []
  );
}

const baseTags = ['description', 'group', 'author', 'date', 'see', 'example', 'mermaid', 'throws', 'exception'];

export function extractCustomTags(type: DocCommentsAware): { name: string; value: string }[] {
  return (
    type.docComment?.annotations
      .filter((currentAnnotation) => !baseTags.includes(currentAnnotation.name.toLowerCase()))
      .map((currentAnnotation) => ({
        name: currentAnnotation.name,
        value: currentAnnotation.body,
      })) ?? []
  );
}

export function isEmptyLine(content: RenderableContent): content is EmptyLine {
  return Object.keys(content).includes('type') && (content as { type: string }).type === 'empty-line';
}
