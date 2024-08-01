export type SourceFile = {
  filePath: string;
  content: string;
  metadataContent: string | null;
};

export type Generator = 'markdown' | 'openapi';
