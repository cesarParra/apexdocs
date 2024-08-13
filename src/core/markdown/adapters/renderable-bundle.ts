import { DocPageReference, ParsedFile } from '../../shared/types';
import { Link, ReferenceGuideReference, RenderableBundle, StringOrLink } from './types';
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

  // TODO: Separate the creation of the references from the renderables
  return parsedFiles.reduce<RenderableBundle>(
    (acc, parsedFile) => {
      const findLinkFromDoc = apply(referenceFinder, ReferencedFrom.DOC);
      const renderable = typeToRenderable(parsedFile, findLinkFromDoc, config);
      acc.renderables.push(renderable);

      const descriptionLines = parsedFile.type.docComment?.descriptionLines;

      const findLinkFromHome = apply(referenceFinder, ReferencedFrom.HOME);
      const reference: ReferenceGuideReference = {
        reference: references[parsedFile.type.name],
        title: findLinkFromHome(parsedFile.type.name) as Link,
        description: adaptDescribable(descriptionLines, findLinkFromHome).description ?? null,
      };

      const group = getTypeGroup(parsedFile.type, config);
      if (!acc.references[group]) {
        acc.references[group] = [];
      }
      acc.references[group].push(reference);

      return acc;
    },
    {
      references: {},
      renderables: [],
    },
  );
}

enum ReferencedFrom {
  // When the reference is from the home file (reference guide, index page)
  HOME = '',
  // When the reference is from a doc page, which can be a sibling or a child of the home file
  DOC = '../',
}

const linkGenerator = (
  references: Record<string, DocPageReference>,
  referenceFrom: ReferencedFrom,
  referenceName: string,
): StringOrLink => {
  const reference: DocPageReference | undefined = references[referenceName];
  return reference
    ? { __type: 'link', title: reference.displayName, url: `${referenceFrom}${reference.pathFromRoot}` }
    : referenceName;
};

function getTypeGroup(type: Type, config: MarkdownGeneratorConfig): string {
  const groupAnnotation = type.docComment?.annotations.find((annotation) => annotation.name.toLowerCase() === 'group');
  return groupAnnotation?.body ?? config.defaultGroupName;
}
