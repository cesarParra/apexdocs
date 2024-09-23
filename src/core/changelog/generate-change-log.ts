import { ParsedFile, UnparsedSourceFile } from '../shared/types';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
// TODO: Move the reflection code to outside of the markdown folder since now it is shared with this
import { reflectBundles, ReflectionErrors } from '../markdown/reflection/reflect-source';
import { processChangeLog, VersionManifest } from './process-change-log';
import { convertToRenderableChangeLog } from './renderable-change-log';
// TODO: Also move this file since this is now shared
import { CompilationRequest, Template } from '../markdown/templates/template';
import { changeLogTemplate } from './templates/change-log-template';

type ChangeLogPageData = {
  // TODO: This should also support frontmatter (and the hook to add it)
  content: string;
  filePath: string;
};

type ChangeLogConfig = {
  targetDir: string;
};

// TODO: We should provide the ability to filter out of scope if we are going
// to be relying on source files and not on a previously generated manifest.
export function generateChangeLog(
  oldBundles: UnparsedSourceFile[],
  newBundles: UnparsedSourceFile[],
  config: ChangeLogConfig,
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

      // TODO: At some point just having a string won't be enough, since we want an object
      // that contains the target file name and directory as well as the content.
      return Template.getInstance().compile(compilationRequest);
    }),
    TE.map((content) => ({
      content,
      // TODO: There should be a way that someone can change the name of the output file
      // TODO: Do not concantenate the strings, but instead use the path module
      filePath: `${config.targetDir}/changelog.md`,
    })),
  );
}

function parsedFilesToManifest(parsedFiles: ParsedFile[]): VersionManifest {
  return {
    types: parsedFiles.map((parsedFile) => parsedFile.type),
  };
}
