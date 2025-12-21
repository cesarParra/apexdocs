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
  lwcGroupName: 'Lightning Web Components',
  includeMetadata: false,
  sortAlphabetically: false,
  linkingStrategy: 'relative' as const,
  referenceGuideTitle: 'Reference Guide',
  excludeTags: [],
  includeFieldSecurityMetadata: false,
  includeInlineHelpTextMetadata: false,
  experimentalLwcSupport: false,

  // Performance: parallel reflection via worker threads (enabled by default).
  parallelReflection: true,
  // Default is computed at runtime if not provided.
  parallelReflectionMaxWorkers: undefined,
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

  // Performance: parallel reflection via worker threads (enabled by default).
  parallelReflection: true,
  // Default is computed at runtime if not provided.
  parallelReflectionMaxWorkers: undefined,
};
