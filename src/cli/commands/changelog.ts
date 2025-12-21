import { Options } from 'yargs';
import { changeLogDefaults } from '../../defaults';
import { markdownDefaults } from '../../defaults';

/**
 * Custom validation function to ensure source directories are provided for both versions
 */
export function validateChangelogArgs(argv: Record<string, unknown>): boolean {
  const hasPreviousVersionDir =
    argv.previousVersionDir &&
    (typeof argv.previousVersionDir === 'string' ||
      (Array.isArray(argv.previousVersionDir) && argv.previousVersionDir.length > 0));

  const hasCurrentVersionDir =
    argv.currentVersionDir &&
    (typeof argv.currentVersionDir === 'string' ||
      (Array.isArray(argv.currentVersionDir) && argv.currentVersionDir.length > 0));

  if (!hasPreviousVersionDir) {
    throw new Error('Must specify --previousVersionDir');
  }

  if (!hasCurrentVersionDir) {
    throw new Error('Must specify --currentVersionDir');
  }

  return true;
}

export const changeLogOptions: { [key: string]: Options } = {
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
  previousVersionDir: {
    type: 'string',
    array: true,
    alias: 'p',
    demandOption: false,
    describe:
      'The directory location(s) of the previous version of the source code. Can specify a single directory or multiple directories.',
  },
  currentVersionDir: {
    type: 'string',
    array: true,
    alias: 'c',
    demandOption: false,
    describe:
      'The directory location(s) of the current version of the source code. Can specify a single directory or multiple directories.',
  },
  targetDir: {
    type: 'string',
    alias: 't',
    default: changeLogDefaults.targetDir,
    describe: 'The directory location where the changelog file will be generated.',
  },
  fileName: {
    type: 'string',
    default: changeLogDefaults.fileName,
    describe: 'The name of the changelog file to be generated.',
  },
  scope: {
    type: 'string',
    array: true,
    alias: 's',
    default: changeLogDefaults.scope,
    describe:
      'The list of scope to respect when generating the changelog. ' +
      'Values should be separated by a space, e.g --scope global public namespaceaccessible. ' +
      'Annotations are supported and should be passed lowercased and without the @ symbol, e.g. namespaceaccessible auraenabled.',
  },
  customObjectVisibility: {
    type: 'string',
    array: true,
    alias: 'v',
    default: changeLogDefaults.customObjectVisibility,
    choices: ['public', 'protected', 'packageprotected'],
    describe: 'Controls which custom objects are documented. Values should be separated by a space.',
  },
  skipIfNoChanges: {
    type: 'boolean',
    default: changeLogDefaults.skipIfNoChanges,
    describe: 'Skip the changelog generation if there are no changes between the previous and current version.',
  },
};
