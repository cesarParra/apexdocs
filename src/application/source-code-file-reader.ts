import { FileSystem } from './file-system';
import { UnparsedApexBundle, UnparsedSObjectBundle } from '../core/shared/types';
import { minimatch } from 'minimatch';
import { flow, pipe } from 'fp-ts/function';
import { apply } from '#utils/fp';

type ComponentTypes = 'ApexClass' | 'CustomObject';

/**
 * Simplified representation of a source component, with only
 * the required information we need.
 */
export type SourceComponentAdapter = {
  name: string;
  type: {
    id: string;
    name: string;
  };
  xml?: string;
  content?: string;
};

type ApexClassApexSourceComponent = {
  type: 'ApexClass';
  name: string;
  xmlPath?: string;
  contentPath: string;
};

type CustomObjectSourceComponent = {
  type: 'CustomObject';
  name: string;
  contentPath: string;
};

function getApexSourceComponents(
  includeMetadata: boolean,
  sourceComponents: SourceComponentAdapter[],
): ApexClassApexSourceComponent[] {
  return sourceComponents
    .filter((component) => component.type.name === 'ApexClass')
    .map((component) => ({
      type: 'ApexClass' as const,
      name: component.name,
      xmlPath: includeMetadata ? component.xml : undefined,
      contentPath: component.content!,
    }));
}

function toUnparsedApexBundle(
  fileSystem: FileSystem,
  apexSourceComponents: ApexClassApexSourceComponent[],
): UnparsedApexBundle[] {
  return apexSourceComponents.map((component) => {
    const apexComponentTuple: [string, string | null] = [
      fileSystem.readFile(component.contentPath),
      component.xmlPath ? fileSystem.readFile(component.xmlPath) : null,
    ];

    return {
      type: 'apex',
      filePath: component.contentPath,
      content: apexComponentTuple[0],
      metadataContent: apexComponentTuple[1],
    };
  });
}

function getCustomObjectSourceComponents(sourceComponents: SourceComponentAdapter[]): CustomObjectSourceComponent[] {
  return sourceComponents
    .filter((component) => component.type.name === 'CustomObject')
    .map((component) => ({
      name: component.name,
      type: 'CustomObject' as const,
      contentPath: component.xml!,
    }));
}

function toUnparsedSObjectBundle(
  fileSystem: FileSystem,
  customObjectSourceComponents: CustomObjectSourceComponent[],
): UnparsedSObjectBundle[] {
  return customObjectSourceComponents.map((component) => {
    return {
      type: 'sobject',
      filePath: component.contentPath,
      content: fileSystem.readFile(component.contentPath),
    };
  });
}

/**
 * Reads from source code files and returns their raw body.
 */
export function processFiles(fileSystem: FileSystem) {
  return function <T extends ComponentTypes[]>(
    componentTypesToRetrieve: T,
    options: { includeMetadata: boolean } = { includeMetadata: false },
  ) {
    const converters: Record<
      ComponentTypes,
      (components: SourceComponentAdapter[]) => (UnparsedApexBundle | UnparsedSObjectBundle)[]
    > = {
      ApexClass: flow(apply(getApexSourceComponents, options.includeMetadata), (apexSourceComponents) =>
        toUnparsedApexBundle(fileSystem, apexSourceComponents),
      ),
      CustomObject: flow(getCustomObjectSourceComponents, (customObjectSourceComponents) =>
        toUnparsedSObjectBundle(fileSystem, customObjectSourceComponents),
      ),
    };

    const convertersToUse = componentTypesToRetrieve.map((componentType) => converters[componentType]);

    return function (rootPath: string, exclude: string[]) {
      return pipe(
        fileSystem.getComponents(rootPath),
        (components) => components.filter((component) => !isExcluded(component.content!, exclude)),
        (components) => convertersToUse.map((converter) => converter(components)),
        (bundles) => bundles.flat(),
      );
    };
  };
}

function isExcluded(filePath: string, exclude: string[]): boolean {
  return exclude.some((pattern) => minimatch(filePath, pattern));
}
