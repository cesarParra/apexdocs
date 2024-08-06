import { Type } from '@cparra/apex-reflection';

export type Generator = 'markdown' | 'openapi';

export type ConfigurableHooks = {
  transformReferenceGuide: TransformReferenceGuide;
  transformDocs: TransformDocs;
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

type Frontmatter = string | null;

export type ReferenceGuidePageData = {
  directory: string;
  frontmatter: Frontmatter;
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
  frontmatter: Frontmatter;
  content: string;
};

export type OpenApiPageData = Omit<DocPageData, 'source'>;

export type PageData = DocPageData | OpenApiPageData | ReferenceGuidePageData;

export type DocumentationBundle = {
  referenceGuide: ReferenceGuidePageData;
  docs: DocPageData[];
};

// Configurable Hooks

export type TransformReferenceGuide = (
  referenceGuide: ReferenceGuidePageData,
) => Partial<ReferenceGuidePageData> | Promise<Partial<ReferenceGuidePageData>>;

export type TransformDocs = (docs: DocPageData[]) => DocPageData[] | Promise<DocPageData[]>;
