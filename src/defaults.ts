export const defaults = {
  targetGenerator: 'markdown' as const,
  targetDir: './docs/',
  scope: ['global'],
  defaultGroupName: 'Miscellaneous',
  includeMetadata: false,
  sortAlphabetically: false,
  linkingStrategy: 'relative' as const,
};
