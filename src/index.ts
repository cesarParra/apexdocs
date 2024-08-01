type MarkdownConfig = {
  sourceDir: string;
  targetDir?: string;
  scope?: string[];
  targetGenerator: 'markdown';
  defaultGroupName?: string; // TODO: Is this needed in openApi?
  namespace?: string; // TODO: Is this needed in openApi?
  sortMembersAlphabetically?: boolean; // TODO: Is this needed in openApi?
  includeMetadata?: boolean; // TODO: Is this needed in openApi?
};

type UserDefinedMarkdownConfig = Omit<MarkdownConfig, 'targetGenerator'>;

// TODO
// type OpenApiConfig = {
//   sourceDir: string;
//   targetDir?: string;
//   targetGenerator: 'openapi';
//   openApiTitle?: string;
//   openApiFileName?: string;
// };

function defineMarkdownConfig(config: UserDefinedMarkdownConfig): MarkdownConfig {
  return {
    ...config,
    targetGenerator: 'markdown',
  };
}

// Exports

export { defineMarkdownConfig };
