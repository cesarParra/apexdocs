import { CustomTag, RenderableDocumentation, RenderableContent, CodeBlock } from './types';
import { Describable, Documentable } from './types';
import { GetRenderableContentByTypeName, replaceInlineReferences } from './references';
import { isEmptyLine } from './type-utils';

export function adaptDescribable(
  describable: Describable,
  linkGenerator: GetRenderableContentByTypeName,
): {
  description?: RenderableContent[];
} {
  function describableToRenderableContent(describable: Describable): RenderableContent[] | undefined {
    if (!describable) {
      return;
    }

    return (
      describable
        .map<RenderableContent[]>((line) => [
          ...replaceInlineReferences(line, linkGenerator),
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

export function adaptDocumentable(
  documentable: Documentable,
  linkGenerator: GetRenderableContentByTypeName,
  subHeadingLevel: number,
): RenderableDocumentation {
  function extractCustomTags(type: Documentable): CustomTag[] {
    const baseTags = ['description', 'group', 'author', 'date', 'see', 'example', 'mermaid', 'throws', 'exception'];

    return (
      type.docComment?.annotations
        .filter((currentAnnotation) => !baseTags.includes(currentAnnotation.name.toLowerCase()))
        .map<CustomTag>((currentAnnotation) => ({
          ...adaptDescribable(currentAnnotation.bodyLines, linkGenerator),
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

  function bodyLinesToCodeBlock(language: string, bodyLines: string[] | undefined): CodeBlock | undefined {
    if (!bodyLines) {
      return;
    }
    return {
      __type: 'code-block',
      language,
      content: bodyLines,
    };
  }

  return {
    ...adaptDescribable(documentable.docComment?.descriptionLines, linkGenerator),
    annotations: documentable.annotations.map((annotation) => annotation.type.toUpperCase()),
    customTags: extractCustomTags(documentable),
    mermaid: {
      headingLevel: subHeadingLevel,
      heading: 'Diagram',
      value: bodyLinesToCodeBlock('mermaid', extractAnnotationBodyLines(documentable, 'mermaid')),
    },
    example: {
      headingLevel: subHeadingLevel,
      heading: 'Example',
      value: bodyLinesToCodeBlock('apex', documentable.docComment?.exampleAnnotation?.bodyLines),
    },
    group: extractAnnotationBody(documentable, 'group'),
    author: extractAnnotationBody(documentable, 'author'),
    date: extractAnnotationBody(documentable, 'date'),
    sees: extractSeeAnnotations(documentable).map(linkGenerator),
  };
}
