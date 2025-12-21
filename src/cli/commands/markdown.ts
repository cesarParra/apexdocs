import { Options } from 'yargs';
import { markdownDefaults } from '../../defaults';
import { CliConfigurableMarkdownConfig } from '../../core/shared/types';

/**
 * Custom validation function to ensure at least one source directory method is provided
 */
export function validateMarkdownArgs(argv: Record<string, unknown>): boolean {
  const hasSourceDir =
    argv.sourceDir &&
    (typeof argv.sourceDir === 'string' || (Array.isArray(argv.sourceDir) && argv.sourceDir.length > 0));
  const hasUseSfdxProjectJson = argv.useSfdxProjectJson;

  if (!hasSourceDir && !hasUseSfdxProjectJson) {
    throw new Error('Must specify one of: --sourceDir or --useSfdxProjectJson');
  }

  return true;
}

export const markdownOptions: Record<keyof CliConfigurableMarkdownConfig, Options> = {
  sourceDir: {
    type: 'string',
    array: true,
    alias: 's',
    demandOption: false,
    describe:
      'The directory location(s) which contain your apex .cls classes. Can specify a single directory or multiple directories. Cannot be used with useSfdxProjectJson.',
    conflicts: ['useSfdxProjectJson'],
  },
  useSfdxProjectJson: {
    type: 'boolean',
    demandOption: false,
    describe: 'Read source directories from sfdx-project.json packageDirectories. Cannot be used with sourceDir.',
    conflicts: ['sourceDir'],
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
  lwcGroupName: {
    type: 'string',
    default: markdownDefaults.lwcGroupName,
    describe: 'The name under which Lightning Web Components will be grouped in the Reference Guide',
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
  experimentalLwcSupport: {
    type: 'boolean',
    describe: 'Enable experimental support for documenting Lightning Web Components (LWC).',
    default: markdownDefaults.experimentalLwcSupport,
  },
  parallelReflection: {
    type: 'boolean',
    describe: 'Parallelize CPU-heavy reflection via worker threads.',
    default: markdownDefaults.parallelReflection,
  },
  parallelReflectionMaxWorkers: {
    type: 'number',
    describe:
      'Maximum number of worker threads to use for parallel reflection. Defaults to a reasonable value based on CPU count.',
    default: markdownDefaults.parallelReflectionMaxWorkers,
  },
};
