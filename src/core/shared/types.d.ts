import { Type } from '@cparra/apex-reflection';
import { CustomObjectMetadata } from '../reflection/sobject/reflect-custom-object-sources';
import { CustomFieldMetadata } from '../reflection/sobject/reflect-custom-field-source';
import { CustomMetadataMetadata } from '../reflection/sobject/reflect-custom-metadata-source';
import { TriggerMetadata } from '../reflection/trigger/reflect-trigger-source';

export type Generators = 'markdown' | 'openapi' | 'changelog';

type LinkingStrategy =
  // Links will be generated using relative paths.
  | 'relative'
  // No links will be generated.
  // If the reference is found, the display name will be used.
  // Otherwise, the name
  // of the reference itself will be used.
  | 'no-link'
  // No logic will be applied, the reference path will be used as is.
  | 'none';

// TODO: Allow macros to either be a string or a function
// TODO: Figure out if we can add arguments (only metadata, like the name of the metadata being parsed, and readonly)
export type MacroFunction = () => string;

export type CliConfigurableMarkdownConfig = {
  sourceDir: string;
  targetDir: string;
  scope: string[];
  customObjectVisibility: string[];
  namespace?: string;
  defaultGroupName: string;
  customObjectsGroupName: string;
  triggersGroupName: string;
  sortAlphabetically: boolean;
  includeMetadata: boolean;
  linkingStrategy: LinkingStrategy;
  referenceGuideTitle: string;
};

export type UserDefinedMarkdownConfig = {
  targetGenerator: 'markdown';
  excludeTags: string[];
  exclude: string[];
} & CliConfigurableMarkdownConfig &
  Partial<MarkdownConfigurableHooks>;

export type UserDefinedOpenApiConfig = {
  targetGenerator: 'openapi';
  sourceDir: string;
  targetDir: string;
  fileName: string;
  namespace?: string;
  title: string;
  apiVersion: string;
  exclude: string[];
};

export type UserDefinedChangelogConfig = {
  targetGenerator: 'changelog';
  previousVersionDir: string;
  currentVersionDir: string;
  targetDir: string;
  fileName: string;
  scope: string[];
  customObjectVisibility: string[];
  exclude: string[];
  skipIfNoChanges: boolean;
} & Partial<ChangelogConfigurableHooks>;

export type UserDefinedConfig = UserDefinedMarkdownConfig | UserDefinedOpenApiConfig | UserDefinedChangelogConfig;

export type UnparsedSourceBundle =
  | UnparsedApexBundle
  | UnparsedCustomObjectBundle
  | UnparsedCustomFieldBundle
  | UnparsedCustomMetadataBundle
  | UnparsedTriggerBundle;

export type UnparsedCustomObjectBundle = {
  type: 'customobject';
  name: string;
  filePath: string;
  content: string;
};

export type UnparsedCustomFieldBundle = {
  type: 'customfield';
  name: string;
  filePath: string;
  content: string;
  parentName: string;
};

export type UnparsedCustomMetadataBundle = {
  type: 'custommetadata';
  apiName: string;
  name: string;
  filePath: string;
  content: string;
  parentName: string;
};

export type UnparsedApexBundle = {
  type: 'apex';
  name: string;
  filePath: string;
  content: string;
  metadataContent: string | null;
};

export type UnparsedTriggerBundle = {
  type: 'trigger';
  name: string;
  filePath: string;
  content: string;
};

type MetadataTypes = 'interface' | 'class' | 'enum' | 'customobject' | 'customfield' | 'custommetadata' | 'trigger';

export type SourceFileMetadata = {
  filePath: string;
  name: string;
  type: MetadataTypes;
};

// External metadata is metadata that does not live directly in the source code, and thus we don't
// have a file path for it.
// This is metadata derived from other information.
// For example, for an "extension"
// field that extends a Salesforce object or object in a different package, we want to capture the parent
// object, even if the file for that object was not parsed.
export type ExternalMetadata = {
  name: string;
  type: MetadataTypes;
};

export type TopLevelType = Type | CustomObjectMetadata | TriggerMetadata;

export type ParsedFile<
  T extends Type | CustomObjectMetadata | CustomFieldMetadata | CustomMetadataMetadata | TriggerMetadata =
    | Type
    | CustomObjectMetadata
    | CustomFieldMetadata
    | CustomMetadataMetadata
    | TriggerMetadata,
> = {
  source: SourceFileMetadata | ExternalMetadata;
  type: T;
};

export type DocPageReference = {
  source: SourceFileMetadata | ExternalMetadata;
  // The name under which the type should be displayed in the documentation.
  // By default, this will match the source.name, but it can be configured by the user.
  displayName: string;
  // The location where the file will be written.
  outputDocPath: string;
  // The path to the file relative to the documentation root directory. This is used when linking to the file.
  // Usually the value will be the same as outputDocPath. However, some site generators may have a different way of
  // organizing the files, so this allows for the flexibility of having a path from linking that is different from
  // the path where the file is written.
  referencePath: string;
};

export type Frontmatter = string | Record<string, unknown> | null;

export type ReferenceGuidePageData = {
  frontmatter: Frontmatter;
  content: string;
  outputDocPath: string;
};

export type DocPageData = {
  source: SourceFileMetadata | ExternalMetadata;
  group: string | null;
  outputDocPath: string;
  frontmatter: Frontmatter;
  content: string;
  type: 'class' | 'interface' | 'enum' | 'customobject' | 'trigger';
};

export type OpenApiPageData = Omit<DocPageData, 'source' | 'type'>;

export type FileChange = {
  name: string;
  fileType: 'apex' | 'customobject';
  changeType: 'added' | 'removed' | 'changed';
  changes?: {
    addedMethods?: string[];
    removedMethods?: string[];
    addedFields?: string[];
    removedFields?: string[];
    addedProperties?: string[];
    removedProperties?: string[];
    addedCustomFields?: string[];
    removedCustomFields?: string[];
    addedSubtypes?: string[];
    removedSubtypes?: string[];
    addedEnumValues?: string[];
    removedEnumValues?: string[];
  };
};

export type SourceChangelog = {
  fileChanges: FileChange[];
};

export type ChangeLogPageData = {
  source: SourceChangelog;
  frontmatter: Frontmatter;
  content: string;
  outputDocPath: string;
};

export type PageData = DocPageData | OpenApiPageData | ReferenceGuidePageData | ChangeLogPageData;

export type DocumentationBundle = {
  referenceGuide: ReferenceGuidePageData;
  docs: DocPageData[];
};

/**
 * Represents a file to be skipped.
 */
export type Skip = {
  readonly _tag: 'Skip';
};

export type PostHookDocumentationBundle = {
  referenceGuide: ReferenceGuidePageData | Skip;
  docs: DocPageData[];
};

// CONFIGURABLE HOOKS

/**
 * The configurable hooks that can be used to modify the output of the Markdown generator.
 */
export type MarkdownConfigurableHooks = {
  macros: Record<string, MacroFunction>;
  transformReferenceGuide: TransformReferenceGuide;
  transformDocs: TransformDocs;
  transformDocPage: TransformDocPage;
  transformReference: TransformReference;
};

export type ConfigurableDocPageReference = Omit<DocPageReference, 'source'>;

export type ConfigurableDocPageData = Omit<DocPageData, 'source' | 'outputDocPath'>;

/**
 * Allows changing where the files are written to.
 */
export type TransformReference = (
  reference: DocPageReference,
) => Partial<ConfigurableDocPageReference> | Promise<ConfigurableDocPageReference>;

/**
 * Allows changing the frontmatter and content of the reference guide, or even if creating a reference
 * guide will be skipped altogether.
 */
export type TransformReferenceGuide = (
  referenceGuide: ReferenceGuidePageData,
) => Partial<ReferenceGuidePageData> | Skip | Promise<Partial<ReferenceGuidePageData> | Skip>;

/**
 * The main purpose if for allowing for doc pages to be skipped, but it can also be used to change the frontmatter
 * and content of the doc pages.
 */
export type TransformDocs = (docs: DocPageData[]) => DocPageData[] | Promise<DocPageData[]>;

/**
 * Allows changing the frontmatter and content of the doc pages.
 */
export type TransformDocPage = (
  doc: DocPageData,
) => Partial<ConfigurableDocPageData> | Promise<Partial<ConfigurableDocPageData>>;

export type ChangelogConfigurableHooks = {
  transformChangeLogPage: TransformChangelogPage;
};

export type TransformChangelogPage = (
  page: ChangeLogPageData,
) => Partial<ChangeLogPageData> | Promise<Partial<ChangeLogPageData>>;
