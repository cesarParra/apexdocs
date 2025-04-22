const commonDefaults = {
  targetDir: './docs/',
};

const markdownAndChangelogDefaults = {
  ...commonDefaults,
  scope: ['global'],
  customObjectVisibility: ['public'],
  exclude: [],
};

export const markdownDefaults = {
  ...markdownAndChangelogDefaults,
  defaultGroupName: 'Miscellaneous',
  customObjectsGroupName: 'Custom Objects',
  triggersGroupName: 'Triggers',
  includeMetadata: false,
  sortAlphabetically: false,
  linkingStrategy: 'relative' as const,
  referenceGuideTitle: 'Reference Guide',
  excludeTags: [],
  includeFieldSecurityMetadata: false,
  includeInlineHelpTextMetadata: false,
};

export const openApiDefaults = {
  ...commonDefaults,
  fileName: 'openapi',
  title: 'Apex REST API',
  apiVersion: '1.0.0',
  exclude: [],
};

export const changeLogDefaults = {
  ...markdownAndChangelogDefaults,
  fileName: 'changelog',
  skipIfNoChanges: true,
};
