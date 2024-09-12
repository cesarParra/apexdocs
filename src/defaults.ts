const commonDefaults = {
  targetDir: './docs/',
};

export const markdownDefaults = {
  ...commonDefaults,
  scope: ['global'],
  defaultGroupName: 'Miscellaneous',
  includeMetadata: false,
  sortAlphabetically: false,
  linkingStrategy: 'relative' as const,
  referenceGuideTitle: 'Apex Reference Guide',
};

export const openApiDefaults = {
  ...commonDefaults,
  fileName: 'openapi',
  title: 'Apex REST API',
  apiVersion: '1.0.0',
};
