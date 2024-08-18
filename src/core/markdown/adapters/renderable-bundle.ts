import { DocPageReference, ParsedFile } from '../../shared/types';
import { Link, ReferenceGuideReference, Renderable, RenderableBundle, StringOrLink } from './types';
import { typeToRenderable } from './apex-types';
import { adaptDescribable } from './documentables';
import { MarkdownGeneratorConfig } from '../generate-docs';
import { apply } from '#utils/fp';
import { Type } from '@cparra/apex-reflection';
import * as path from 'path';

export function parsedFilesToRenderableBundle(
  config: MarkdownGeneratorConfig,
  parsedFiles: ParsedFile[],
  references: Record<string, DocPageReference>,
): RenderableBundle {
  const referenceFinder = apply(linkGenerator, references, config.documentationRootDir);

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

const linkGenerator = (
  references: Record<string, DocPageReference>,
  documentationRootDir: string,
  from: string, // The name of the file for which the reference is being generated
  referenceName: string,
): StringOrLink => {
  const referenceTo: DocPageReference | undefined = references[referenceName];
  // When linking from the base path (e.g. the reference guide/index page), the reference path is the same as the output
  // path.
  if (referenceTo && from === '__base__') {
    return {
      __type: 'link',
      title: referenceTo.displayName,
      url: path.join(documentationRootDir, referenceTo.referencePath),
    };
  }

  const referenceFrom: DocPageReference | undefined = references[from];

  if (!referenceFrom || !referenceTo) {
    return referenceName;
  }

  // Gets the directory of the file that is being linked from.
  // This is used to calculate the relative path to the file
  // being linked to.
  const fromPath = path.parse(path.join('/', documentationRootDir, referenceFrom.referencePath)).dir;
  const toPath = path.join('/', documentationRootDir, referenceTo.referencePath);
  const relativePath = path.relative(fromPath, toPath);

  return {
    __type: 'link',
    title: referenceTo.displayName,
    url: relativePath,
  };
};

function getTypeGroup(type: Type, config: MarkdownGeneratorConfig): string {
  const groupAnnotation = type.docComment?.annotations.find((annotation) => annotation.name.toLowerCase() === 'group');
  return groupAnnotation?.body ?? config.defaultGroupName;
}
