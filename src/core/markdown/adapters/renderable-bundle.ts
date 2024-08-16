import { DocPageReference, ParsedFile } from '../../shared/types';
import { Link, ReferenceGuideReference, Renderable, RenderableBundle, StringOrLink } from './types';
import { typeToRenderable } from './apex-types';
import { adaptDescribable } from './documentables';
import { MarkdownGeneratorConfig } from '../generate-docs';
import { apply } from '#utils/fp';
import { Type } from '@cparra/apex-reflection';

export function parsedFilesToRenderableBundle(
  config: MarkdownGeneratorConfig,
  parsedFiles: ParsedFile[],
  references: Record<string, DocPageReference>,
): RenderableBundle {
  const referenceFinder = apply(linkGenerator, references);

  function toReferenceGuide(parsedFiles: ParsedFile[]): Record<string, ReferenceGuideReference[]> {
    return parsedFiles.reduce<Record<string, ReferenceGuideReference[]>>(
      addToReferenceGuide(referenceFinder, config, references),
      {},
    );
  }

  function toRenderables(parsedFiles: ParsedFile[]): Renderable[] {
    return parsedFiles.reduce<Renderable[]>((acc, parsedFile) => {
      const renderable = typeToRenderable(parsedFile, referenceFinder, config);
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

const linkGenerator = (references: Record<string, DocPageReference>, referenceName: string): StringOrLink => {
  const reference: DocPageReference | undefined = references[referenceName];
  return reference
    ? // Starting the path with a "/" will ensure the link will always be relative to the root of the site.
      { __type: 'link', title: reference.displayName, url: `/${reference.pathFromRoot}` }
    : referenceName;
};

function getTypeGroup(type: Type, config: MarkdownGeneratorConfig): string {
  const groupAnnotation = type.docComment?.annotations.find((annotation) => annotation.name.toLowerCase() === 'group');
  return groupAnnotation?.body ?? config.defaultGroupName;
}
