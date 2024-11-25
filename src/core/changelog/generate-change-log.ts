import {
  ChangeLogPageData,
  FileChange,
  ParsedFile,
  Skip,
  SourceChangelog,
  TransformChangelogPage,
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
import { HookError, ReflectionErrors } from '../errors/errors';
import { apply } from '#utils/fp';
import { filterScope } from '../reflection/apex/filter-scope';
import { isInSource, isSkip, passThroughHook, skip, toFrontmatterString } from '../shared/utils';
import { reflectCustomFieldsAndObjects } from '../reflection/sobject/reflectCustomFieldsAndObjects';
import { CustomObjectMetadata } from '../reflection/sobject/reflect-custom-object-sources';
import { Type } from '@cparra/apex-reflection';
import { filterApexSourceFiles, filterCustomObjectsAndFields } from '#utils/source-bundle-utils';
import { CustomFieldMetadata } from '../reflection/sobject/reflect-custom-field-source';
import { hookableTemplate } from '../markdown/templates/hookable';

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
    return pipe(convertToRenderableChangelog(changelog, newManifest.types), compile, (content) =>
      convertToPageData(content, changelog),
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

function toManifests({ oldVersion, newVersion }: { oldVersion: ParsedFile[]; newVersion: ParsedFile[] }) {
  function parsedFilesToManifest(parsedFiles: ParsedFile[]): VersionManifest {
    return {
      types: parsedFiles.reduce(
        (previousValue: (Type | CustomObjectMetadata | CustomFieldMetadata)[], parsedFile: ParsedFile) => {
          if (!isInSource(parsedFile.source) && parsedFile.type.type_name === 'customobject') {
            // When we are dealing with a custom object that was not in the source (for extension fields), we return all
            // of its fields.
            return [...previousValue, ...parsedFile.type.fields];
          }
          return [...previousValue, parsedFile.type];
        },
        [] as (Type | CustomObjectMetadata | CustomFieldMetadata)[],
      ),
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

function toPageData(fileName: string, content: string, changelog: Changelog): ChangeLogPageData {
  return {
    source: changelogToSourceChangelog(changelog),
    frontmatter: null,
    content,
    outputDocPath: `${fileName}.md`,
  };
}

function changelogToSourceChangelog(changelog: Changelog): SourceChangelog {
  const newApexTypes = changelog.newApexTypes.map<FileChange>((newType) => {
    return {
      name: newType,
      fileType: 'apex',
      changeType: 'added',
    };
  });

  const removedApexTypes = changelog.removedApexTypes.map<FileChange>((removedType) => {
    return {
      name: removedType,
      fileType: 'apex',
      changeType: 'removed',
    };
  });

  const newCustomObjects = changelog.newCustomObjects.map<FileChange>((newType) => {
    return {
      name: newType,
      fileType: 'customobject',
      changeType: 'added',
    };
  });

  const removedCustomObjects = changelog.removedCustomObjects.map<FileChange>((removedType) => {
    return {
      name: removedType,
      fileType: 'customobject',
      changeType: 'removed',
    };
  });

  const modifiedApexTypes = changelog.newOrModifiedApexMembers.map<FileChange>((modifiedType) => {
    return {
      name: modifiedType.typeName,
      fileType: 'apex',
      changeType: 'changed',
      changes: {
        addedMethods: modifiedType.modifications.filter((mod) => mod.__typename === 'NewMethod').map((mod) => mod.name),
        removedMethods: modifiedType.modifications
          .filter((mod) => mod.__typename === 'RemovedMethod')
          .map((mod) => mod.name),
        addedFields: modifiedType.modifications.filter((mod) => mod.__typename === 'NewField').map((mod) => mod.name),
        removedFields: modifiedType.modifications
          .filter((mod) => mod.__typename === 'RemovedField')
          .map((mod) => mod.name),
        addedProperties: modifiedType.modifications
          .filter((mod) => mod.__typename === 'NewProperty')
          .map((mod) => mod.name),
        removedProperties: modifiedType.modifications
          .filter((mod) => mod.__typename === 'RemovedProperty')
          .map((mod) => mod.name),
        addedSubtypes: modifiedType.modifications.filter((mod) => mod.__typename === 'NewType').map((mod) => mod.name),
        removedSubtypes: modifiedType.modifications
          .filter((mod) => mod.__typename === 'RemovedType')
          .map((mod) => mod.name),
        addedEnumValues: modifiedType.modifications
          .filter((mod) => mod.__typename === 'NewEnumValue')
          .map((mod) => mod.name),
        removedEnumValues: modifiedType.modifications
          .filter((mod) => mod.__typename === 'RemovedEnumValue')
          .map((mod) => mod.name),
      },
    };
  });

  const modifiedCustomObjects = changelog.customObjectModifications.map<FileChange>((modifiedType) => {
    return {
      name: modifiedType.typeName,
      fileType: 'customobject',
      changeType: 'changed',
      changes: {
        addedCustomFields: modifiedType.modifications
          .filter((mod) => mod.__typename === 'NewField')
          .map((mod) => mod.name),
        removedCustomFields: modifiedType.modifications
          .filter((mod) => mod.__typename === 'RemovedField')
          .map((mod) => mod.name),
      },
    };
  });

  return {
    fileChanges: [
      ...newApexTypes,
      ...removedApexTypes,
      ...newCustomObjects,
      ...removedCustomObjects,
      ...modifiedApexTypes,
      ...modifiedCustomObjects,
    ],
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
