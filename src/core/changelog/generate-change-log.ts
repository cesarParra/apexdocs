import { ParsedFile, UnparsedSourceFile, UserDefinedChangelogConfig } from '../shared/types';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { reflectBundles } from '../reflection/reflect-source';
import { processChangelog, VersionManifest } from './process-changelog';
import { convertToRenderableChangelog, RenderableChangelog } from './renderable-changelog';
import { CompilationRequest, Template } from '../template';
import { changelogTemplate } from './templates/changelog-template';
import { ReflectionErrors } from '../errors/errors';
import { apply } from '#utils/fp';
import { filterScope } from '../reflection/filter-scope';

export type ChangeLogPageData = {
  content: string;
  outputDocPath: string;
};

export function generateChangeLog(
  oldBundles: UnparsedSourceFile[],
  newBundles: UnparsedSourceFile[],
  config: Omit<UserDefinedChangelogConfig, 'targetGenerator'>,
): TE.TaskEither<ReflectionErrors, ChangeLogPageData> {
  const filterOutOfScope = apply(filterScope, config.scope);

  function reflect(sourceFiles: UnparsedSourceFile[]) {
    return pipe(reflectBundles(sourceFiles), TE.map(filterOutOfScope));
  }

  const convertToPageData = apply(toPageData, config.fileName);

  return pipe(
    reflect(oldBundles),
    TE.bindTo('oldVersion'),
    TE.bind('newVersion', () => reflect(newBundles)),
    TE.map(toManifests),
    TE.map(({ oldManifest, newManifest }) => ({
      changeLog: processChangelog(oldManifest, newManifest),
      newManifest,
    })),
    TE.map(({ changeLog, newManifest }) => convertToRenderableChangelog(changeLog, newManifest.types)),
    TE.map(compile),
    TE.map(convertToPageData),
  );
}

function toManifests({ oldVersion, newVersion }: { oldVersion: ParsedFile[]; newVersion: ParsedFile[] }) {
  function parsedFilesToManifest(parsedFiles: ParsedFile[]): VersionManifest {
    return {
      types: parsedFiles.map((parsedFile) => parsedFile.type),
    };
  }

  return {
    oldManifest: parsedFilesToManifest(oldVersion),
    newManifest: parsedFilesToManifest(newVersion),
  };
}

function compile(renderable: RenderableChangelog): string {
  const compilationRequest: CompilationRequest = {
    template: changelogTemplate,
    source: renderable,
  };

  return Template.getInstance().compile(compilationRequest);
}

function toPageData(fileName: string, content: string): ChangeLogPageData {
  return {
    content,
    outputDocPath: `${fileName}.md`,
  };
}
