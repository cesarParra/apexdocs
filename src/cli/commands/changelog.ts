import { Options } from 'yargs';
import { changeLogDefaults } from '../../defaults';

/**
 * Custom validation function to ensure at least one source directory method is provided for both versions
 */
export function validateChangelogArgs(argv: Record<string, unknown>): boolean {
  const hasPreviousSourceDir = argv.previousVersionDir;
  const hasPreviousSourceDirs = Array.isArray(argv.previousVersionDirs) && argv.previousVersionDirs.length > 0;
  const hasUseSfdxProjectJsonForPrevious = argv.useSfdxProjectJsonForPrevious;

  const hasCurrentSourceDir = argv.currentVersionDir;
  const hasCurrentSourceDirs = Array.isArray(argv.currentVersionDirs) && argv.currentVersionDirs.length > 0;
  const hasUseSfdxProjectJsonForCurrent = argv.useSfdxProjectJsonForCurrent;

  if (!hasPreviousSourceDir && !hasPreviousSourceDirs && !hasUseSfdxProjectJsonForPrevious) {
    throw new Error(
      'Must specify one of: --previousVersionDir, --previousVersionDirs, or --useSfdxProjectJsonForPrevious',
    );
  }

  if (!hasCurrentSourceDir && !hasCurrentSourceDirs && !hasUseSfdxProjectJsonForCurrent) {
    throw new Error(
      'Must specify one of: --currentVersionDir, --currentVersionDirs, or --useSfdxProjectJsonForCurrent',
    );
  }

  return true;
}

export const changeLogOptions: { [key: string]: Options } = {
  previousVersionDir: {
    type: 'string',
    alias: 'p',
    demandOption: false,
    describe:
      'The directory location of the previous version of the source code. Cannot be used with previousVersionDirs or useSfdxProjectJsonForPrevious.',
    conflicts: ['previousVersionDirs', 'useSfdxProjectJsonForPrevious'],
  },
  previousVersionDirs: {
    type: 'string',
    array: true,
    demandOption: false,
    describe:
      'Multiple directory locations of the previous version of the source code. Cannot be used with previousVersionDir or useSfdxProjectJsonForPrevious.',
    conflicts: ['previousVersionDir', 'useSfdxProjectJsonForPrevious'],
  },
  useSfdxProjectJsonForPrevious: {
    type: 'boolean',
    demandOption: false,
    describe:
      'Read previous version source directories from sfdx-project.json packageDirectories. Cannot be used with previousVersionDir or previousVersionDirs.',
    conflicts: ['previousVersionDir', 'previousVersionDirs'],
  },
  sfdxProjectPathForPrevious: {
    type: 'string',
    demandOption: false,
    describe:
      'Path to the directory containing sfdx-project.json for previous version (defaults to current working directory). Only used with useSfdxProjectJsonForPrevious.',
    implies: 'useSfdxProjectJsonForPrevious',
  },
  currentVersionDir: {
    type: 'string',
    alias: 'c',
    demandOption: false,
    describe:
      'The directory location of the current version of the source code. Cannot be used with currentVersionDirs or useSfdxProjectJsonForCurrent.',
    conflicts: ['currentVersionDirs', 'useSfdxProjectJsonForCurrent'],
  },
  currentVersionDirs: {
    type: 'string',
    array: true,
    demandOption: false,
    describe:
      'Multiple directory locations of the current version of the source code. Cannot be used with currentVersionDir or useSfdxProjectJsonForCurrent.',
    conflicts: ['currentVersionDir', 'useSfdxProjectJsonForCurrent'],
  },
  useSfdxProjectJsonForCurrent: {
    type: 'boolean',
    demandOption: false,
    describe:
      'Read current version source directories from sfdx-project.json packageDirectories. Cannot be used with currentVersionDir or currentVersionDirs.',
    conflicts: ['currentVersionDir', 'currentVersionDirs'],
  },
  sfdxProjectPathForCurrent: {
    type: 'string',
    demandOption: false,
    describe:
      'Path to the directory containing sfdx-project.json for current version (defaults to current working directory). Only used with useSfdxProjectJsonForCurrent.',
    implies: 'useSfdxProjectJsonForCurrent',
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
