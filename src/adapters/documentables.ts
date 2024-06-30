import { CustomTag, RenderableDocumentation, RenderableContent } from '../templating/types';
import { Describable, Documentable } from './types';
import { linkFromTypeNameGenerator, replaceInlineReferences } from './references';
import { isEmptyLine } from './type-utils';

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

export function adaptDocumentable(documentable: Documentable, subHeadingLevel: number): RenderableDocumentation {
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

  function extractAnnotationBody(type: Documentable, annotationName: string): string | undefined {
    return type.docComment?.annotations.find(
      (currentAnnotation) => currentAnnotation.name.toLowerCase() === annotationName,
    )?.body;
  }

  function extractSeeAnnotations(type: Documentable): string[] {
    return (
      type.docComment?.annotations
        .filter((currentAnnotation) => currentAnnotation.name.toLowerCase() === 'see')
        .map((currentAnnotation) => currentAnnotation.body) ?? []
    );
  }

  return {
    ...adaptDescribable(documentable.docComment?.descriptionLines),
    annotations: documentable.annotations.map((annotation) => annotation.type.toUpperCase()),
    customTags: extractCustomTags(documentable),
    mermaid: {
      headingLevel: subHeadingLevel,
      heading: 'Diagram',
      value: extractAnnotationBodyLines(documentable, 'mermaid'),
    },
    example: {
      headingLevel: subHeadingLevel,
      heading: 'Example',
      value: documentable.docComment?.exampleAnnotation?.bodyLines,
    },
    group: extractAnnotationBody(documentable, 'group'),
    author: extractAnnotationBody(documentable, 'author'),
    date: extractAnnotationBody(documentable, 'date'),
    sees: extractSeeAnnotations(documentable).map(linkFromTypeNameGenerator),
  };
}
