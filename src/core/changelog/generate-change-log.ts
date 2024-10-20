import { ParsedFile, Skip, UnparsedApexBundle, UserDefinedChangelogConfig } from '../shared/types';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { reflectApexSource } from '../reflection/apex/reflect-apex-source';
import { Changelog, hasChanges, processChangelog, VersionManifest } from './process-changelog';
import { convertToRenderableChangelog, RenderableChangelog } from './renderable-changelog';
import { CompilationRequest, Template } from '../template';
import { changelogTemplate } from './templates/changelog-template';
import { ReflectionErrors } from '../errors/errors';
import { apply } from '#utils/fp';
import { filterScope } from '../reflection/apex/filter-scope';
import { isApexType, skip } from '../shared/utils';

export type ChangeLogPageData = {
  content: string;
  outputDocPath: string;
};

export function generateChangeLog(
  oldBundles: UnparsedApexBundle[],
  newBundles: UnparsedApexBundle[],
  config: Omit<UserDefinedChangelogConfig, 'targetGenerator'>,
): TE.TaskEither<ReflectionErrors, ChangeLogPageData | Skip> {
  const filterOutOfScope = apply(filterScope, config.scope);

  function reflect(sourceFiles: UnparsedApexBundle[]) {
    return pipe(reflectApexSource(sourceFiles), TE.map(filterOutOfScope));
  }

  const convertToPageData = apply(toPageData, config.fileName);

  function handleConversion({ changelog, newManifest }: { changelog: Changelog; newManifest: VersionManifest }) {
    if (config.skipIfNoChanges && !hasChanges(changelog)) {
      return skip();
    }
    return pipe(convertToRenderableChangelog(changelog, newManifest.types), compile, convertToPageData);
  }

  return pipe(
    reflect(oldBundles),
    TE.bindTo('oldVersion'),
    TE.bind('newVersion', () => reflect(newBundles)),
    TE.map(toManifests),
    TE.map(({ oldManifest, newManifest }) => ({
      changelog: processChangelog(oldManifest, newManifest),
      newManifest,
    })),
    TE.map(handleConversion),
  );
}

function toManifests({ oldVersion, newVersion }: { oldVersion: ParsedFile[]; newVersion: ParsedFile[] }) {
  function parsedFilesToManifest(parsedFiles: ParsedFile[]): VersionManifest {
    return {
      types: parsedFiles
        .map((parsedFile) => parsedFile.type)
        // Changelog does not currently support object types
        .filter((type) => isApexType(type)),
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
