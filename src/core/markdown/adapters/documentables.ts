import { CustomTag, RenderableDocumentation, RenderableContent } from './types';
import { Describable, Documentable, GetRenderableContentByTypeName } from './types';
import { replaceInlineReferences } from './inline';
import { isEmptyLine } from './type-utils';

export function adaptDescribable(
  describable: Describable,
  linkGenerator: GetRenderableContentByTypeName,
): {
  description?: RenderableContent[];
} {
  return {
    description: describableToRenderableContent(describable, linkGenerator),
  };
}

export function describableToRenderableContent(
  describable: Describable,
  linkGenerator: GetRenderableContentByTypeName,
): RenderableContent[] | undefined {
  if (!describable) {
    return;
  }

  let content: RenderableContent[] = [];
  for (let i = 0; i < describable.length; i++) {
    const line = describable[i];
    // The language might or might not be present after ```
    const codeBlockMatch = line.match(/^```([a-zA-Z]*)$/);
    if (codeBlockMatch) {
      // Check if the language is present, if not, fallback to "apex"
      const language = codeBlockMatch[1] || 'apex';
      const codeBlockLines: string[] = [];
      i++;
      while (i < describable.length) {
        const currentLine = describable[i];
        if (currentLine.trim() === '```') {
          break;
        }
        codeBlockLines.push(currentLine);
        i++;
      }
      content = [
        ...content,
        {
          __type: 'code-block',
          language,
          content: codeBlockLines,
        },
        { __type: 'empty-line' },
      ];
      continue;
    }

    content = [
      ...content,
      ...replaceInlineReferences(line, linkGenerator),
      {
        __type: 'empty-line',
      },
    ];
  }
  return (
    content
      // If the last element is an empty line, remove it
      .filter((line, index, lines) => !(isEmptyLine(line) && index === lines.length - 1))
  );
}

export function adaptDocumentable(
  documentable: Documentable,
  linkGenerator: GetRenderableContentByTypeName,
  subHeadingLevel: number,
): RenderableDocumentation {
  function extractCustomTags(type: Documentable): CustomTag[] {
    const baseTags = ['description', 'group', 'author', 'date', 'see', 'example', 'throws', 'exception'];

    return (
      type.docComment?.annotations
        .filter((currentAnnotation) => !baseTags.includes(currentAnnotation.name.toLowerCase()))
        .map<CustomTag>((currentAnnotation) => ({
          ...adaptDescribable(currentAnnotation.bodyLines, linkGenerator),
          name: currentAnnotation.name,
        })) ?? []
    );
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
    ...adaptDescribable(documentable.docComment?.descriptionLines, linkGenerator),
    annotations: documentable.annotations.map((annotation) => annotation.type.toUpperCase()),
    customTags: extractCustomTags(documentable),
    example: {
      headingLevel: subHeadingLevel,
      heading: 'Example',
      value: describableToRenderableContent(documentable.docComment?.exampleAnnotation?.bodyLines, linkGenerator),
    },
    group: extractAnnotationBody(documentable, 'group'),
    author: extractAnnotationBody(documentable, 'author'),
    date: extractAnnotationBody(documentable, 'date'),
    sees: extractSeeAnnotations(documentable).map(linkGenerator),
  };
}
