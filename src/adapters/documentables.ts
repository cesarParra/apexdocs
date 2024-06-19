import { CustomTag, DocumentableSource, RenderableContent } from '../templating/types';
import { Describable, Documentable } from './types';
import { replaceInlineReferences } from './references';
import { isEmptyLine } from './type-utils';

// TODO: Unit tests
export function adaptDescribable(describable: Describable): { description?: RenderableContent[] } {
  function describableToRenderableContent(describable: Describable): RenderableContent[] | undefined {
    if (!describable) {
      return;
    }

    return (
      describable
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

  return {
    description: describableToRenderableContent(describable),
  };
}

// TODO: Unit tests
export function adaptDocumentable(documentable: Documentable): DocumentableSource {
  function extractCustomTags(type: Documentable): CustomTag[] {
    const baseTags = ['description', 'group', 'author', 'date', 'see', 'example', 'mermaid', 'throws', 'exception'];

    return (
      type.docComment?.annotations
        .filter((currentAnnotation) => !baseTags.includes(currentAnnotation.name.toLowerCase()))
        .map<CustomTag>((currentAnnotation) => ({
          ...adaptDescribable(currentAnnotation.bodyLines),
          name: currentAnnotation.name,
        })) ?? []
    );
  }

  function extractAnnotationBodyLines(type: Documentable, annotationName: string): string[] | undefined {
    return type.docComment?.annotations.find(
      (currentAnnotation) => currentAnnotation.name.toLowerCase() === annotationName,
    )?.bodyLines;
  }

  return {
    ...adaptDescribable(documentable.docComment?.descriptionLines),
    annotations: documentable.annotations.map((annotation) => annotation.type.toUpperCase()),
    customTags: extractCustomTags(documentable),
    mermaid: extractAnnotationBodyLines(documentable, 'mermaid'),
    example: documentable.docComment?.exampleAnnotation?.bodyLines,
  };
}
