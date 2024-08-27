import { Type } from '@cparra/apex-reflection';

/**
 * The configurable hooks that can be used to modify the output of the generator.
 */
export type ConfigurableHooks = {
  transformReferenceGuide: TransformReferenceGuide;
  transformDocs: TransformDocs;
  transformDocPage: TransformDocPage;
  transformReference: TransformReference;
};

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

export type UserDefinedMarkdownConfig = {
  targetGenerator: 'markdown';
  sourceDir: string;
  targetDir: string;
  scope: string[];
  defaultGroupName: string;
  namespace?: string;
  sortMembersAlphabetically: boolean;
  includeMetadata: boolean;
  linkingStrategy: LinkingStrategy;
} & Partial<ConfigurableHooks>;

export type UserDefinedOpenApiConfig = {
  targetGenerator: 'openapi';
  sourceDir: string;
  targetDir: string;
  fileName: string;
  namespace?: string;
  title: string;
  apiVersion: string;
};

export type UserDefinedConfig = UserDefinedMarkdownConfig | UserDefinedOpenApiConfig;

export type UnparsedSourceFile = {
  filePath: string;
  content: string;
  metadataContent: string | null;
};

export type SourceFileMetadata = {
  filePath: string;
  name: string;
  type: 'interface' | 'class' | 'enum';
};

export type ParsedFile = {
  source: SourceFileMetadata;
  type: Type;
};

export type DocPageReference = {
  source: SourceFileMetadata;
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

type Frontmatter = string | Record<string, unknown> | null;

export type ReferenceGuidePageData = {
  frontmatter: Frontmatter;
  content: string;
  outputDocPath: string;
};

export type DocPageData = {
  source: SourceFileMetadata;
  group: string | null;
  outputDocPath: string;
  frontmatter: Frontmatter;
  content: string;
};

export type OpenApiPageData = Omit<DocPageData, 'source'>;

export type PageData = DocPageData | OpenApiPageData | ReferenceGuidePageData;

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

// Configurable Hooks

type ConfigurableDocPageReference = Omit<DocPageReference, 'source'>;

type ConfigurableDocPageData = Omit<DocPageData, 'source' | 'outputDocPath'>;

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
