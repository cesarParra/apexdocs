import { Type } from '@cparra/apex-reflection';

export type SourceFile = {
  filePath: string;
  content: string;
  metadataContent: string | null;
};

export type ParsedFile = {
  filePath: string;
  type: Type;
};

export type Generator = 'markdown' | 'openapi';

// TODO: This looks too close to the MarkdownConfig type in the index.ts file
// Let's see if we can merge them
export type DocumentationConfig = {
  scope: string[];
  outputDir: string;
  namespace?: string;
  sortMembersAlphabetically?: boolean;
  defaultGroupName: string;
  referenceGuideTemplate: string;
};

export type ReferenceGuidePageData = {
  directory: string;
  frontmatter: Record<string, unknown> | null;
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
