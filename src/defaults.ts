const commonDefaults = {
  targetDir: './docs/',
};

export const markdownDefaults = {
  customObjectVisibility: ['public'],
  ...commonDefaults,
  scope: ['global'],
  defaultGroupName: 'Miscellaneous',
  customObjectsGroupName: 'Custom Objects',
  includeMetadata: false,
  sortAlphabetically: false,
  linkingStrategy: 'relative' as const,
  referenceGuideTitle: 'Reference Guide',
  excludeTags: [],
  exclude: [],
};

export const openApiDefaults = {
  ...commonDefaults,
  fileName: 'openapi',
  title: 'Apex REST API',
  apiVersion: '1.0.0',
  exclude: [],
};

export const changeLogDefaults = {
  ...commonDefaults,
  fileName: 'changelog',
  scope: ['global'],
  exclude: [],
  skipIfNoChanges: true,
};
