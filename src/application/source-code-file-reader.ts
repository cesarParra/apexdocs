import { FileSystem } from './file-system';
import {
  UnparsedApexBundle,
  UnparsedCustomFieldBundle,
  UnparsedCustomMetadataBundle,
  UnparsedCustomObjectBundle, UnparsedLightningComponentBundle,
  UnparsedTriggerBundle,
} from '../core/shared/types';
import { minimatch } from 'minimatch';
import { flow, pipe } from 'fp-ts/function';
import { apply } from '#utils/fp';

export type ComponentTypes =
  'ApexClass'
  | 'CustomObject'
  | 'CustomField'
  | 'CustomMetadata'
  | 'ApexTrigger'
  | 'LightningComponentBundle';
export const allComponentTypes: ComponentTypes[] = [
  'ApexClass',
  'CustomObject',
  'CustomField',
  'CustomMetadata',
  'ApexTrigger',
  'LightningComponentBundle'
];

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

type LightningComponentBundleSourceComponent = {
  type: 'LightningComponentBundle';
  name: string;
  xmlPath: string;
  contentPath: string;
}

type TriggerSourceComponent = {
  type: 'ApexTrigger';
  name: string;
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

type CustomMetadataSourceComponent = {
  type: 'CustomMetadata';
  apiName: string;
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

function getLightningComponentBundleSourceComponents(
  sourceComponents: SourceComponentAdapter[],
): LightningComponentBundleSourceComponent[] {
  return sourceComponents
    .filter((component) => component.type.name === 'LightningComponentBundle')
    .map((component) => ({
      type: 'LightningComponentBundle' as const,
      name: component.name,
      xmlPath: component.xml!,
      // The content path for an LWC is the JS file, which will be the same path as
      // the xml but instead of ending in .js-meta.xml it will end in .js
      contentPath: component.xml!.replace('.js-meta.xml', '.js'),
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

function getTriggerSourceComponents(sourceComponents: SourceComponentAdapter[]): TriggerSourceComponent[] {
  return sourceComponents
    .filter((component) => component.type.name === 'ApexTrigger')
    .map((component) => ({
      type: 'ApexTrigger' as const,
      name: component.name,
      contentPath: component.content!,
    }));
}

function toUnparsedTriggerBundle(
  fileSystem: FileSystem,
  triggerSourceComponents: TriggerSourceComponent[],
): UnparsedTriggerBundle[] {
  return triggerSourceComponents.map((component) => ({
    type: 'trigger',
    name: component.name,
    filePath: component.contentPath,
    content: fileSystem.readFile(component.contentPath),
  }));
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

function getCustomMetadataSourceComponents(
  sourceComponents: SourceComponentAdapter[],
): CustomMetadataSourceComponent[] {
  function getParentAndNamePair(component: SourceComponentAdapter): [string, string] {
    // Custom metadata take the format [Namespace].[ParentName].[MetadataName], where namespace is optional.
    // Here we split the string and return the last 2 elements, representing the parent and the metadata name.
    const [parentName, name] = component.name.split('.').slice(-2);
    return [parentName, name];
  }

  return sourceComponents
    .filter((component) => component.type.name === 'CustomMetadata')
    .map((component) => ({
      apiName: component.name,
      name: getParentAndNamePair(component)[1],
      type: 'CustomMetadata' as const,
      contentPath: component.xml!,
      parentName: getParentAndNamePair(component)[0],
    }));
}

function toUnparsedCustomMetadataBundle(
  fileSystem: FileSystem,
  customMetadataSourceComponents: CustomMetadataSourceComponent[],
): UnparsedCustomMetadataBundle[] {
  return customMetadataSourceComponents.map((component) => ({
    apiName: component.apiName,
    type: 'custommetadata',
    name: component.name,
    filePath: component.contentPath,
    content: fileSystem.readFile(component.contentPath),
    parentName: component.parentName,
  }));
}


function toUnparsedLWCBundle(fileSystem: FileSystem, lwcSourceComponents: LightningComponentBundleSourceComponent[]): UnparsedLightningComponentBundle[] {
  return lwcSourceComponents.map((component) => ({
    type: 'lwc',
    name: component.name,
    filePath: component.contentPath,
    content: fileSystem.readFile(component.contentPath),
    metadataContent: fileSystem.readFile(component.xmlPath),
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
      ) => (
        | UnparsedApexBundle
        | UnparsedCustomObjectBundle
        | UnparsedCustomFieldBundle
        | UnparsedCustomMetadataBundle
        | UnparsedTriggerBundle
        | UnparsedLightningComponentBundle
        )[]
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
      CustomMetadata: flow(getCustomMetadataSourceComponents, (customMetadataSourceComponents) =>
        toUnparsedCustomMetadataBundle(fileSystem, customMetadataSourceComponents),
      ),
      ApexTrigger: flow(getTriggerSourceComponents, (triggerSourceComponents) =>
        toUnparsedTriggerBundle(fileSystem, triggerSourceComponents),
      ),
      LightningComponentBundle: flow(getLightningComponentBundleSourceComponents, (lwcSourceComponents) =>
        toUnparsedLWCBundle(fileSystem, lwcSourceComponents),
      ),
    };

    const convertersToUse = componentTypesToRetrieve.map((componentType) => converters[componentType]);

    return (rootPaths: string | string[], exclude: string[]) => {
      const paths = Array.isArray(rootPaths) ? rootPaths : [rootPaths];

      const allComponents = paths.flatMap((path) => fileSystem.getComponents(path));

      return pipe(
        allComponents,
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
