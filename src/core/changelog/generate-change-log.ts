import {
  ParsedFile,
  Skip,
  UnparsedApexBundle,
  UnparsedSourceBundle,
  UserDefinedChangelogConfig,
} from '../shared/types';
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
import { skip } from '../shared/utils';
import { reflectCustomFieldsAndObjects } from '../reflection/sobject/reflectCustomFieldsAndObjects';
import { CustomObjectMetadata } from '../reflection/sobject/reflect-custom-object-sources';
import { Type } from '@cparra/apex-reflection';
import { filterApexSourceFiles, filterCustomObjectsAndFields } from '#utils/source-bundle-utils';

export type ChangeLogPageData = {
  content: string;
  outputDocPath: string;
};

export function generateChangeLog(
  oldBundles: UnparsedSourceBundle[],
  newBundles: UnparsedSourceBundle[],
  config: Omit<UserDefinedChangelogConfig, 'targetGenerator'>,
): TE.TaskEither<ReflectionErrors, ChangeLogPageData | Skip> {
  const convertToPageData = apply(toPageData, config.fileName);

  function handleConversion({ changelog, newManifest }: { changelog: Changelog; newManifest: VersionManifest }) {
    if (config.skipIfNoChanges && !hasChanges(changelog)) {
      return skip();
    }
    return pipe(convertToRenderableChangelog(changelog, newManifest.types), compile, convertToPageData);
  }

  return pipe(
    reflect(oldBundles, config),
    TE.bindTo('oldVersion'),
    TE.bind('newVersion', () => reflect(newBundles, config)),
    TE.map(toManifests),
    TE.map(({ oldManifest, newManifest }) => ({
      changelog: processChangelog(oldManifest, newManifest),
      newManifest,
    })),
    TE.map(handleConversion),
  );
}

function reflect(bundles: UnparsedSourceBundle[], config: Omit<UserDefinedChangelogConfig, 'targetGenerator'>) {
  const filterOutOfScopeApex = apply(filterScope, config.scope);

  function reflectApexFiles(sourceFiles: UnparsedApexBundle[]) {
    return pipe(reflectApexSource(sourceFiles), TE.map(filterOutOfScopeApex));
  }

  return pipe(
    reflectApexFiles(filterApexSourceFiles(bundles)),
    TE.chain((parsedApexFiles) => {
      return pipe(
        reflectCustomFieldsAndObjects(filterCustomObjectsAndFields(bundles)),
        TE.map((parsedObjectFiles) => [...parsedApexFiles, ...parsedObjectFiles]),
      );
    }),
  );
}

function toManifests({
  oldVersion,
  newVersion,
}: {
  oldVersion: ParsedFile<Type | CustomObjectMetadata>[];
  newVersion: ParsedFile<Type | CustomObjectMetadata>[];
}) {
  function parsedFilesToManifest(parsedFiles: ParsedFile<Type | CustomObjectMetadata>[]): VersionManifest {
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
