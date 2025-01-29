import { FileSystem } from './file-system';
import { UnparsedApexBundle, UnparsedCustomFieldBundle, UnparsedCustomObjectBundle } from '../core/shared/types';
import { minimatch } from 'minimatch';
import { flow, pipe } from 'fp-ts/function';
import { apply } from '#utils/fp';

type ComponentTypes = 'ApexClass' | 'CustomObject' | 'CustomField';

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
  parent?: {
    name: string;
  };
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

type CustomFieldSourceComponent = {
  type: 'CustomField';
  name: string;
  contentPath: string;
  parentName: string;
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
      name: component.name,
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
): UnparsedCustomObjectBundle[] {
  return customObjectSourceComponents.map((component) => {
    return {
      type: 'customobject',
      name: component.name,
      filePath: component.contentPath,
      content: fileSystem.readFile(component.contentPath),
    };
  });
}

function getCustomFieldSourceComponents(sourceComponents: SourceComponentAdapter[]): CustomFieldSourceComponent[] {
  return sourceComponents
    .filter((component) => component.type.name === 'CustomField')
    .map((component) => ({
      name: component.name,
      type: 'CustomField' as const,
      contentPath: component.xml!,
      parentName: component.parent!.name,
    }));
}

function toUnparsedCustomFieldBundle(
  fileSystem: FileSystem,
  customFieldSourceComponents: CustomFieldSourceComponent[],
): UnparsedCustomFieldBundle[] {
  return customFieldSourceComponents.map((component) => ({
    type: 'customfield',
    name: component.name,
    filePath: component.contentPath,
    content: fileSystem.readFile(component.contentPath),
    parentName: component.parentName,
  }));
}

/**
 * Reads from source code files and returns their raw body.
 */
export function processFiles(fileSystem: FileSystem) {
  return <T extends ComponentTypes[]>(
    componentTypesToRetrieve: T,
    options: { includeMetadata: boolean } = { includeMetadata: false },
  ) => {
    const converters: Record<
      ComponentTypes,
      (
        components: SourceComponentAdapter[],
      ) => (UnparsedApexBundle | UnparsedCustomObjectBundle | UnparsedCustomFieldBundle)[]
    > = {
      ApexClass: flow(apply(getApexSourceComponents, options.includeMetadata), (apexSourceComponents) =>
        toUnparsedApexBundle(fileSystem, apexSourceComponents),
      ),
      CustomObject: flow(getCustomObjectSourceComponents, (customObjectSourceComponents) =>
        toUnparsedSObjectBundle(fileSystem, customObjectSourceComponents),
      ),
      CustomField: flow(getCustomFieldSourceComponents, (customFieldSourceComponents) =>
        toUnparsedCustomFieldBundle(fileSystem, customFieldSourceComponents),
      ),
    };

    const convertersToUse = componentTypesToRetrieve.map((componentType) => converters[componentType]);

    return (rootPath: string, exclude: string[]) => {
      return pipe(
        fileSystem.getComponents(rootPath),
        (components) => {
          return components.map((component) => {
            const pathLocation = component.type.name === 'ApexClass' ? component.content : component.xml;
            return {
              ...component,
              filePath: pathLocation,
            };
          });
        },
        (components) => components.filter((component) => !isExcluded(component.filePath, exclude)),
        (components) => convertersToUse.map((converter) => converter(components)),
        (bundles) => bundles.flat(),
      );
    };
  };
}

function isExcluded(filePath: string | undefined, exclude: string[]): boolean {
  if (!filePath) {
    return true;
  }
  return exclude.some((pattern) => minimatch(filePath, pattern));
}
