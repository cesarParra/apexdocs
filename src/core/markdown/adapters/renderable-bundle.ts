import { DocPageReference, ParsedFile } from '../../shared/types';
import { Link, ReferenceGuideReference, Renderable, RenderableBundle } from './types';
import { typeToRenderable } from './apex-types';
import { adaptDescribable } from './documentables';
import { MarkdownGeneratorConfig } from '../generate-docs';
import { apply } from '#utils/fp';
import { Type } from '@cparra/apex-reflection';
import { generateLink } from './generate-link';

export function parsedFilesToRenderableBundle(
  config: MarkdownGeneratorConfig,
  parsedFiles: ParsedFile[],
  references: Record<string, DocPageReference>,
): RenderableBundle {
  const referenceFinder = apply(generateLink(config.linkingStrategy), references);

  function toReferenceGuide(parsedFiles: ParsedFile[]): Record<string, ReferenceGuideReference[]> {
    return parsedFiles.reduce<Record<string, ReferenceGuideReference[]>>(
      addToReferenceGuide(apply(referenceFinder, '__base__'), config, references),
      {},
    );
  }

  function toRenderables(parsedFiles: ParsedFile[]): Renderable[] {
    return parsedFiles.reduce<Renderable[]>((acc, parsedFile) => {
      const renderable = typeToRenderable(parsedFile, apply(referenceFinder, parsedFile.source.name), config);
      acc.push(renderable);
      return acc;
    }, []);
  }

  return {
    referencesByGroup: toReferenceGuide(parsedFiles),
    renderables: toRenderables(parsedFiles),
  };
}

function addToReferenceGuide(
  findLinkFromHome: (referenceName: string) => string | Link,
  config: MarkdownGeneratorConfig,
  references: Record<string, DocPageReference>,
) {
  return (acc: Record<string, ReferenceGuideReference[]>, parsedFile: ParsedFile) => {
    const group: string = getTypeGroup(parsedFile.type, config);
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push({
      reference: references[parsedFile.type.name],
      title: findLinkFromHome(parsedFile.type.name) as Link,
      description: adaptDescribable(parsedFile.type.docComment?.descriptionLines, findLinkFromHome).description ?? null,
    });

    return acc;
  };
}

function getTypeGroup(type: Type, config: MarkdownGeneratorConfig): string {
  const groupAnnotation = type.docComment?.annotations.find((annotation) => annotation.name.toLowerCase() === 'group');
  return groupAnnotation?.body ?? config.defaultGroupName;
}
