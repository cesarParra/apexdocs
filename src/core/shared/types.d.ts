import { Type } from '@cparra/apex-reflection';

export type Generator = 'markdown' | 'openapi';

export type ConfigurableHooks = {
  transformReferenceGuide: TransformReferenceGuide;
};

export type UserDefinedMarkdownConfig = {
  targetGenerator: 'markdown';
  sourceDir: string;
  targetDir: string;
  scope: string[];
  defaultGroupName: string;
  namespace?: string;
  sortMembersAlphabetically?: boolean;
  includeMetadata: boolean;
} & Partial<ConfigurableHooks>;

export type UserDefinedOpenApiConfig = {
  targetGenerator: 'openapi';
  sourceDir: string;
  targetDir: string;
  includeMetadata: boolean;
};

export type UserDefinedConfig = UserDefinedMarkdownConfig | UserDefinedOpenApiConfig;

export type SourceFile = {
  filePath: string;
  content: string;
  metadataContent: string | null;
};

export type ParsedFile = {
  filePath: string;
  type: Type;
};

export type ReferenceGuidePageData = {
  directory: string;
  frontmatter: string | null; // TODO: This could also be a Record<string, unknown>, but keeping it simple for now
  content: string;
  fileExtension: string;
  fileName: string;
};

export type DocPageData = {
  source: {
    filePath: string;
    name: string;
    type: 'interface' | 'class' | 'enum';
  };
  fileName: string;
  fileExtension: string;
  directory: string;
  frontmatter: Record<string, unknown> | null;
  content: string;
};

export type OpenApiPageData = Omit<DocPageData, 'source'>;

export type PageData = DocPageData | OpenApiPageData | ReferenceGuidePageData;

export type DocumentationBundle = {
  referenceGuide: ReferenceGuidePageData;
  docs: DocPageData[];
};

// Configurable Hooks

// TODO: Make Awaitable so that we can use promises in this hook
export type TransformReferenceGuide = (referenceGuide: ReferenceGuidePageData) => Partial<ReferenceGuidePageData>;
