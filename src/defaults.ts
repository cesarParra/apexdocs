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
  parallelReflection: true,
  parallelReflectionMaxWorkers: undefined,
};

export const openApiDefaults = {
  ...commonDefaults,
  fileName: 'openapi',
  title: 'Apex REST API',
  apiVersion: '1.0.0',
  exclude: [],
  parallelReflection: true,
  parallelReflectionMaxWorkers: undefined,
};

export const changeLogDefaults = {
  ...markdownAndChangelogDefaults,
  fileName: 'changelog',
  skipIfNoChanges: true,
  parallelReflection: true,
  parallelReflectionMaxWorkers: undefined,
};
