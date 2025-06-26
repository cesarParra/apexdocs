import { Options } from 'yargs';
import { markdownDefaults } from '../../defaults';
import { CliConfigurableMarkdownConfig } from '../../core/shared/types';

/**
 * Custom validation function to ensure at least one source directory method is provided
 */
export function validateMarkdownArgs(argv: Record<string, unknown>): boolean {
  const hasSourceDir = argv.sourceDir;
  const hasSourceDirs = Array.isArray(argv.sourceDirs) && argv.sourceDirs.length > 0;
  const hasUseSfdxProjectJson = argv.useSfdxProjectJson;

  if (!hasSourceDir && !hasSourceDirs && !hasUseSfdxProjectJson) {
    throw new Error('Must specify one of: --sourceDir, --sourceDirs, or --useSfdxProjectJson');
  }

  return true;
}

export const markdownOptions: Record<keyof CliConfigurableMarkdownConfig, Options> = {
  sourceDir: {
    type: 'string',
    alias: 's',
    demandOption: false,
    describe:
      'The directory location which contains your apex .cls classes. Cannot be used with sourceDirs or useSfdxProjectJson.',
    conflicts: ['sourceDirs', 'useSfdxProjectJson'],
  },
  sourceDirs: {
    type: 'string',
    array: true,
    demandOption: false,
    describe:
      'Multiple directory locations which contain your apex .cls classes. Cannot be used with sourceDir or useSfdxProjectJson.',
    conflicts: ['sourceDir', 'useSfdxProjectJson'],
  },
  useSfdxProjectJson: {
    type: 'boolean',
    demandOption: false,
    describe:
      'Read source directories from sfdx-project.json packageDirectories. Cannot be used with sourceDir or sourceDirs.',
    conflicts: ['sourceDir', 'sourceDirs'],
  },
  sfdxProjectPath: {
    type: 'string',
    demandOption: false,
    describe:
      'Path to the directory containing sfdx-project.json (defaults to current working directory). Only used with useSfdxProjectJson.',
    implies: 'useSfdxProjectJson',
  },
  targetDir: {
    type: 'string',
    alias: 't',
    default: markdownDefaults.targetDir,
    describe: 'The directory location where documentation will be generated to.',
  },
  scope: {
    type: 'string',
    array: true,
    alias: 'p',
    default: markdownDefaults.scope,
    describe:
      'A list of scopes to document. Values should be separated by a space, e.g --scope global public namespaceaccessible. ' +
      'Annotations are supported and should be passed lowercased and without the @ symbol, e.g. namespaceaccessible auraenabled.',
  },
  customObjectVisibility: {
    type: 'string',
    array: true,
    alias: 'v',
    default: markdownDefaults.customObjectVisibility,
    choices: ['public', 'protected', 'packageprotected'],
    describe: 'Controls which custom objects are documented. Values should be separated by a space.',
  },
  defaultGroupName: {
    type: 'string',
    default: markdownDefaults.defaultGroupName,
    describe: 'Defines the @group name to be used when a file does not specify it.',
  },
  customObjectsGroupName: {
    type: 'string',
    default: markdownDefaults.customObjectsGroupName,
    describe: 'The name under which custom objects will be grouped in the Reference Guide',
  },
  triggersGroupName: {
    type: 'string',
    default: markdownDefaults.triggersGroupName,
    describe: 'The name under which triggers will be grouped in the Reference Guide',
  },
  namespace: {
    type: 'string',
    describe: 'The package namespace, if any. If provided, it will be added to the generated files.',
  },
  sortAlphabetically: {
    type: 'boolean',
    describe: 'Whether to sort files and members alphabetically.',
    default: markdownDefaults.sortAlphabetically,
  },
  includeMetadata: {
    type: 'boolean',
    describe: "Whether to include the file's meta.xml information: Whether it is active and and the API version",
    default: markdownDefaults.includeMetadata,
  },
  linkingStrategy: {
    type: 'string',
    describe: 'The strategy to use when linking to other documentation pages.',
    choices: ['relative', 'no-link', 'none'],
    default: markdownDefaults.linkingStrategy,
  },
  referenceGuideTitle: {
    type: 'string',
    describe: 'The title of the reference guide.',
    default: markdownDefaults.referenceGuideTitle,
  },
  includeFieldSecurityMetadata: {
    type: 'boolean',
    describe:
      'Whether to include the compliance category and security classification for fields in the generated files.',
    default: markdownDefaults.includeFieldSecurityMetadata,
  },
  includeInlineHelpTextMetadata: {
    type: 'boolean',
    describe: 'Whether to include the inline help text for fields in the generated files.',
  },
};
