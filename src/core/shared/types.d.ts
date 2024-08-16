import { Type } from '@cparra/apex-reflection';

export type Generator = 'markdown' | 'openapi';

/**
 * The configurable hooks that can be used to modify the output of the generator.
 */
export type ConfigurableHooks = {
  transformReferenceGuide: TransformReferenceGuide;
  transformDocs: TransformDocs;
  transformDocPage: TransformDocPage;
  transformReference: TransformReference;
};

export type UserDefinedMarkdownConfig = {
  targetGenerator: 'markdown';
  sourceDir: string;
  targetDir: string;
  scope: string[];
  defaultGroupName: string;
  namespace?: string;
  sortMembersAlphabetically: boolean;
  includeMetadata: boolean;
  documentationRootDir: string;
} & Partial<ConfigurableHooks>;

export type UserDefinedOpenApiConfig = {
  targetGenerator: 'openapi';
  sourceDir: string;
  targetDir: string;
  includeMetadata: boolean;
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
  // The location of the file relative to the root of the documentation.
  pathFromRoot: string;
};

type Frontmatter = string | Record<string, unknown> | null;

export type ReferenceGuidePageData = {
  frontmatter: Frontmatter;
  content: string;
  filePath: string;
};

export type DocPageData = {
  source: SourceFileMetadata;
  group: string | null;
  filePath: string;
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

type ConfigurableDocPageData = Omit<DocPageData, 'source' | 'filePath'>;

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
