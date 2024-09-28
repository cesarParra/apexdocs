import { ParsedFile, UnparsedSourceFile, UserDefinedChangelogConfig } from '../shared/types';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
// TODO: Move the reflection code to outside of the markdown folder since now it is shared with this
import { reflectBundles } from '../reflection/reflect-source';
import { processChangeLog, VersionManifest } from './process-change-log';
import { convertToRenderableChangeLog } from './renderable-change-log';
// TODO: Also move this file since this is now shared
import { CompilationRequest, Template } from '../markdown/templates/template';
import { changeLogTemplate } from './templates/change-log-template';
import { ReflectionErrors } from '../errors/errors';

export type ChangeLogPageData = {
  // TODO: This should also support frontmatter (and the hook to add it)
  content: string;
  outputDocPath: string;
};

// TODO: Also provide the ability to have a previously generated manifest as an input
// TODO: Also provide the ability to have 2 git refs as input

// TODO: We should provide the ability to filter out of scope if we are going
// to be relying on source files and not on a previously generated manifest.
// TODO: And also the "exclude" property in the config, it should be fairly simple to add.
export function generateChangeLog(
  oldBundles: UnparsedSourceFile[],
  newBundles: UnparsedSourceFile[],
  config: Omit<UserDefinedChangelogConfig, 'targetGenerator'>,
): TE.TaskEither<ReflectionErrors, ChangeLogPageData> {
  return pipe(
    reflectBundles(oldBundles),
    TE.bindTo('oldVersion'),
    TE.bind('newVersion', () => reflectBundles(newBundles)),
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
