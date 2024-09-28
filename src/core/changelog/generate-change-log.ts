import { ParsedFile, UnparsedSourceFile, UserDefinedChangelogConfig } from '../shared/types';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { reflectBundles } from '../reflection/reflect-source';
import { processChangeLog, VersionManifest } from './process-change-log';
import { convertToRenderableChangeLog } from './renderable-change-log';
import { CompilationRequest, Template } from '../template';
import { changeLogTemplate } from './templates/change-log-template';
import { ReflectionErrors } from '../errors/errors';
import { apply } from '#utils/fp';
import { filterScope } from '../reflection/filter-scope';

export type ChangeLogPageData = {
  // TODO: This should also support frontmatter (and the hook to add it)
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

  return pipe(
    reflect(oldBundles),
    TE.bindTo('oldVersion'),
    TE.bind('newVersion', () => reflect(newBundles)),
    TE.map(({ oldVersion, newVersion }) => ({
      oldManifest: parsedFilesToManifest(oldVersion),
      newManifest: parsedFilesToManifest(newVersion),
    })),
    TE.map(({ oldManifest, newManifest }) => ({
      changeLog: processChangeLog(oldManifest, newManifest),
      newManifest,
    })),
    TE.map(({ changeLog, newManifest }) => convertToRenderableChangeLog(changeLog, newManifest.types)),
    TE.map((renderable) => {
      const compilationRequest: CompilationRequest = {
        template: changeLogTemplate,
        source: renderable,
      };

      return Template.getInstance().compile(compilationRequest);
    }),
    TE.map((content) => ({
      content,
      outputDocPath: `${config.fileName}.md`,
    })),
  );
}

function parsedFilesToManifest(parsedFiles: ParsedFile[]): VersionManifest {
  return {
    types: parsedFiles.map((parsedFile) => parsedFile.type),
  };
}
