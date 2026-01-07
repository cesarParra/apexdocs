import {
  ChangeLogPageData,
  ParsedFile,
  ParsedType,
  Skip,
  TransformChangelogPage,
  UnparsedSourceBundle,
  UserDefinedChangelogConfig,
} from '../shared/types';
import { mergeTranslations } from '../translations';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { reflectApexSourceBestEffort, ReflectionDebugLogger } from '../reflection/apex/reflect-apex-source';
import { Changelog, hasChanges, processChangelog, VersionManifest } from './process-changelog';
import { convertToRenderableChangelog, RenderableChangelog } from './renderable-changelog';
import { CompilationRequest, Template } from '../template';
import { changelogTemplate } from './templates/changelog-template';
import { HookError, ReflectionErrors } from '../errors/errors';
import { apply } from '#utils/fp';
import { filterScope } from '../reflection/apex/filter-scope';
import { isInSource, isSkip, passThroughHook, skip, toFrontmatterString } from '../shared/utils';
import { reflectCustomFieldsAndObjectsAndMetadataRecords } from '../reflection/sobject/reflectCustomFieldsAndObjectsAndMetadataRecords';
import { filterApexSourceFiles, filterCustomObjectsFieldsAndMetadataRecords } from '#utils/source-bundle-utils';
import { hookableTemplate } from '../markdown/templates/hookable';
import changelogToSourceChangelog from './helpers/changelog-to-source-changelog';
import { reflectTriggerSource } from '../reflection/trigger/reflect-trigger-source';
import { filterTriggerFiles } from '#utils/source-bundle-utils';

function changelogReflectionConfig(config: Omit<UserDefinedChangelogConfig, 'targetGenerator'>) {
  return {
    parallelReflection: config.parallelReflection,
    parallelReflectionMaxWorkers: config.parallelReflectionMaxWorkers,
  } as const;
}

type Config = Omit<UserDefinedChangelogConfig, 'targetGenerator'>;

type Reflected = {
  parsedFiles: ParsedFile[];
  errors: ReflectionErrors;
};

export function generateChangeLog(
  oldBundles: UnparsedSourceBundle[],
  newBundles: UnparsedSourceBundle[],
  config: Config,
  debugLogger: ReflectionDebugLogger,
): TE.TaskEither<ReflectionErrors | HookError, ChangeLogPageData | Skip> {
  const convertToPageData = apply(toPageData, config.fileName);

  function handleConversion({ changelog, newManifest }: { changelog: Changelog; newManifest: VersionManifest }) {
    if (config.skipIfNoChanges && !hasChanges(changelog)) {
      return skip();
    }
    const translations = mergeTranslations({ changelog: config.translations });
    return pipe(
      convertToRenderableChangelog(changelog, newManifest.types, translations),
      compile(translations),
      (content) => convertToPageData(content, changelog),
    );
  }

  const reflectVersionBestEffort = (
    bundles: UnparsedSourceBundle[],
  ): TE.TaskEither<ReflectionErrors | HookError, Reflected> => {
    const filterOutOfScopeApex = apply(filterScope, config.scope);

    const apexConfig = changelogReflectionConfig(config);

    return pipe(
      TE.right(bundles),
      TE.bindTo('bundles'),
      TE.bind('apex', ({ bundles }) =>
        pipe(
          reflectApexSourceBestEffort(
            filterApexSourceFiles(bundles.filter((b) => b.type !== 'lwc')),
            apexConfig,
            debugLogger,
          ),
          TE.map(({ successes, errors }) => ({
            parsedFiles: filterOutOfScopeApex(successes),
            errors,
          })),
          TE.orElseW((errs) => TE.right({ parsedFiles: [] as ParsedFile[], errors: errs })),
        ),
      ),
      TE.bind('objects', ({ bundles, apex }) =>
        pipe(
          reflectCustomFieldsAndObjectsAndMetadataRecords(
            filterCustomObjectsFieldsAndMetadataRecords(bundles),
            config.customObjectVisibility,
            debugLogger,
          ),
          TE.map((parsedObjectFiles) => ({
            parsedFiles: [...apex.parsedFiles, ...parsedObjectFiles],
            errors: apex.errors,
          })),
          // We swallow failures here and keep going, because this helper's left type is `never`.
          // Any such failures are treated as if this step produced no additional parsed files.
          TE.orElseW(() => TE.right({ parsedFiles: apex.parsedFiles, errors: apex.errors })),
        ),
      ),
      TE.bind('all', ({ objects, bundles }) =>
        pipe(
          reflectTriggerSource(filterTriggerFiles(bundles), debugLogger),
          TE.map((parsedTriggerFiles) => ({
            parsedFiles: [...objects.parsedFiles, ...parsedTriggerFiles],
            errors: objects.errors,
          })),
          // We swallow failures here and keep going, because this helper's left type is `never`.
          // Any such failures are treated as if no triggers were parsed.
          TE.orElseW(() => TE.right({ parsedFiles: objects.parsedFiles, errors: objects.errors })),
        ),
      ),
      TE.map(({ all }) => all),
    );
  };

  return pipe(
    TE.Do,
    TE.bind('old', () => reflectVersionBestEffort(oldBundles)),
    TE.bind('nw', () => reflectVersionBestEffort(newBundles)),
    TE.map(({ old, nw }) => ({
      oldVersion: old.parsedFiles,
      newVersion: nw.parsedFiles,
      // Keep all recoverable Apex reflection errors from both versions.
      combinedReflectionErrors: new ReflectionErrors([...old.errors.errors, ...nw.errors.errors]),
    })),
    TE.map(({ oldVersion, newVersion, combinedReflectionErrors }) => ({
      manifests: toManifests({ oldVersion, newVersion }),
      combinedReflectionErrors,
    })),
    TE.map(({ manifests, combinedReflectionErrors }) => ({
      changelog: processChangelog(manifests.oldManifest, manifests.newManifest),
      newManifest: manifests.newManifest,
      combinedReflectionErrors,
    })),
    TE.map(({ changelog, newManifest, combinedReflectionErrors }) => ({
      page: handleConversion({ changelog, newManifest }),
      combinedReflectionErrors,
    })),
    TE.flatMap(({ page, combinedReflectionErrors }) =>
      pipe(
        transformChangelogPageHook(config)(page),
        TE.map((transformed) => ({ page: transformed, combinedReflectionErrors })),
      ),
    ),
    TE.map(({ page, combinedReflectionErrors }) => ({
      page: postHookCompile(page),
      combinedReflectionErrors,
    })),
    // Fail at the very end if we had any recoverable reflection errors,
    // so the CLI can set an exit code after completing the work.
    //
    // We intentionally do NOT propagate individual error item details here.
    // Those are recorded via the per-generator ErrorCollector as they happen.
    TE.flatMap(({ page, combinedReflectionErrors }) => {
      if (combinedReflectionErrors.errors.length > 0) {
        return TE.left(new ReflectionErrors([]));
      }
      return TE.right(page);
    }),
  );
}

function toManifests({ oldVersion, newVersion }: { oldVersion: ParsedFile[]; newVersion: ParsedFile[] }) {
  function parsedFilesToManifest(parsedFiles: ParsedFile[]): VersionManifest {
    return {
      types: parsedFiles.reduce((previousValue: ParsedType[], parsedFile: ParsedFile) => {
        if (!isInSource(parsedFile.source) && parsedFile.type.type_name === 'customobject') {
          // When we are dealing with a custom object that was not in the source (for extension fields), we return all
          // of its fields.
          return [...previousValue, ...parsedFile.type.fields];
        }
        return [...previousValue, parsedFile.type];
      }, [] as ParsedType[]),
    };
  }

  return {
    oldManifest: parsedFilesToManifest(oldVersion),
    newManifest: parsedFilesToManifest(newVersion),
  };
}

function compile(translations: ReturnType<typeof mergeTranslations>) {
  return (renderable: RenderableChangelog): string => {
    const compilationRequest: CompilationRequest = {
      template: changelogTemplate,
      source: {
        ...renderable,
        title: translations.changelog.title,
      },
    };

    return Template.getInstance().compile(compilationRequest);
  };
}

function toPageData(fileName: string, content: string, changelog: Changelog): ChangeLogPageData {
  return {
    source: changelogToSourceChangelog(changelog),
    frontmatter: null,
    content,
    outputDocPath: `${fileName}.md`,
  };
}

function transformChangelogPageHook(config: Config) {
  return (page: ChangeLogPageData | Skip) =>
    TE.tryCatch(
      () => transformChangelogPage(page, config.transformChangeLogPage),
      (error) => new HookError(error),
    );
}

async function transformChangelogPage(
  page: ChangeLogPageData | Skip,
  hook: TransformChangelogPage = passThroughHook,
): Promise<ChangeLogPageData | Skip> {
  if (isSkip(page)) {
    return page;
  }
  return {
    ...page,
    ...(await hook(page)),
  };
}

function postHookCompile(page: ChangeLogPageData | Skip): ChangeLogPageData | Skip {
  if (isSkip(page)) {
    return page;
  }
  return {
    ...page,
    content: Template.getInstance().compile({
      source: {
        frontmatter: toFrontmatterString(page.frontmatter),
        content: page.content,
      },
      template: hookableTemplate,
    }),
  };
}
