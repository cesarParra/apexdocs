import { Type } from '@cparra/apex-reflection';

export type Generator = 'markdown' | 'openapi';

export type ConfigurationHooks = {
  transformReferenceGuide: TransformReferenceGuide;
};

// TODO: This looks too close to the MarkdownConfig type in the index.ts file
// Let's see if we can merge them
export type UserDefinedMarkdownConfig = {
  targetGenerator: 'markdown';
  sourceDir: string;
  targetDir: string;
  scope: string[];
  defaultGroupName: string; // TODO: Is this needed in openApi?
  namespace?: string; // TODO: Is this needed in openApi?
  sortMembersAlphabetically?: boolean; // TODO: Is this needed in openApi?
  includeMetadata: boolean; // TODO: Is this needed in openApi?
} & Partial<ConfigurationHooks>;

// TODO
// type OpenApiConfig = {
//   sourceDir: string;
//   targetDir?: string;
//   targetGenerator: 'openapi';
//   openApiTitle?: string;
//   openApiFileName?: string;
// };

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
