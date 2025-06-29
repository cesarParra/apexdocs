import { DocPageReference, ParsedFile, TopLevelType } from '../../shared/types';
import {
  Link,
  ReferenceGuideReference,
  Renderable,
  RenderableBundle,
  RenderableContent,
} from '../../renderables/types';
import { typeToRenderable } from './type-to-renderable';
import { adaptDescribable } from '../../renderables/documentables';
import { MarkdownGeneratorConfig } from '../generate-docs';
import { apply } from '#utils/fp';
import { generateLink } from './generate-link';
import { getTypeGroup } from '../../shared/utils';
import { Translations } from '../../translations';

export function parsedFilesToRenderableBundle(
  config: MarkdownGeneratorConfig,
  parsedFiles: ParsedFile<TopLevelType>[],
  references: Record<string, DocPageReference>,
  translations: Translations,
): RenderableBundle {
  const referenceFinder = apply(generateLink(config.linkingStrategy), references);

  function toReferenceGuide(parsedFiles: ParsedFile<TopLevelType>[]): Record<string, ReferenceGuideReference[]> {
    return parsedFiles.reduce<Record<string, ReferenceGuideReference[]>>(
      addToReferenceGuide(apply(referenceFinder, '__base__'), config, references),
      {},
    );
  }

  function toRenderables(parsedFiles: ParsedFile<TopLevelType>[]): Renderable[] {
    return parsedFiles.reduce<Renderable[]>((acc, parsedFile) => {
      const renderable = typeToRenderable(
        parsedFile,
        apply(referenceFinder, parsedFile.source.name),
        config,
        translations,
      );
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
  return (acc: Record<string, ReferenceGuideReference[]>, parsedFile: ParsedFile<TopLevelType>) => {
    const group: string = getTypeGroup(parsedFile.type, config);
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push({
      reference: references[parsedFile.source.name],
      title: findLinkFromHome(parsedFile.source.name) as Link,
      description: getRenderableDescription(parsedFile.type, findLinkFromHome),
    });

    return acc;
  };
}

function getRenderableDescription(
  type: TopLevelType,
  findLinkFromHome: (referenceName: string) => string | Link,
): RenderableContent[] | null {
  switch (type.type_name) {
    case 'customobject':
      return type.description ? [type.description] : null;
    default:
      return adaptDescribable(type.docComment?.descriptionLines, findLinkFromHome).description ?? null;
  }
}
