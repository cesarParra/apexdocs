export type SourceFile = {
  filePath: string;
  content: string;
  metadataContent: string | null;
};

export type Generator = 'markdown' | 'openapi';

type ReferenceGuidePageData = {
  __type: 'reference-guide';
  filePath: string;
  frontmatter: Record<string, unknown> | null;
  content: string;
};

type DocPageData = {
  source: {
    filePath: string;
    typeName: string;
    type: 'interface' | 'class' | 'enum';
  };
  filePath: string;
  frontmatter: Record<string, unknown> | null;
  content: string;
};

type PageData = ReferenceGuidePageData | DocPageData;
