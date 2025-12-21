import {
  ChangeLogPageData,
  ParsedFile,
  ParsedType,
  Skip,
  TransformChangelogPage,
  UnparsedApexBundle,
  UnparsedSourceBundle,
  UserDefinedChangelogConfig,
} from '../shared/types';
import { mergeTranslations } from '../translations';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { reflectApexSource } from '../reflection/apex/reflect-apex-source';
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

export function generateChangeLog(
  oldBundles: UnparsedSourceBundle[],
  newBundles: UnparsedSourceBundle[],
  config: Config,
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
    TE.flatMap(transformChangelogPageHook(config)),
    TE.map(postHookCompile),
  );
}

function reflect(bundles: UnparsedSourceBundle[], config: Omit<UserDefinedChangelogConfig, 'targetGenerator'>) {
  const filterOutOfScopeApex = apply(filterScope, config.scope);

  function reflectApexFiles(sourceFiles: UnparsedApexBundle[]) {
    return pipe(reflectApexSource(sourceFiles, changelogReflectionConfig(config)), TE.map(filterOutOfScopeApex));
  }

  return pipe(
    // Filter out LWC. These will be implemented at a later date
    reflectApexFiles(filterApexSourceFiles(bundles.filter((b) => b.type !== 'lwc'))),
    TE.chain((parsedApexFiles) => {
      return pipe(
        reflectCustomFieldsAndObjectsAndMetadataRecords(
          filterCustomObjectsFieldsAndMetadataRecords(bundles),
          config.customObjectVisibility,
        ),
        TE.map((parsedObjectFiles) => [...parsedApexFiles, ...parsedObjectFiles]),
      );
    }),
    TE.chain((parsedFiles) => {
      return pipe(
        reflectTriggerSource(filterTriggerFiles(bundles)),
        TE.map((parsedTriggerFiles) => [...parsedFiles, ...parsedTriggerFiles]),
      );
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
