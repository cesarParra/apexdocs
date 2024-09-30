import { Options } from 'yargs';
import { changeLogDefaults } from '../../defaults';

export const changeLogOptions: { [key: string]: Options } = {
  previousVersionDir: {
    type: 'string',
    alias: 'p',
    demandOption: true,
    describe:
      'The directory location of the previous version of the source code. ' +
      'If previousGitReference is provided, this value should be the directory in which the ' +
      'Apex source code resides within the repository.',
  },
  // TODO: Validate that if previousGitReference is provided, repoPath is also provided.
  repoPath: {
    type: 'string',
    alias: 'g',
    describe: 'The path to the git repository. Must be provided if previousGitReference is provided.',
  },
  previousGitReference: {
    type: 'string',
    alias: 'r',
    describe: 'The git reference of the previous version of the source code.',
  },
  currentVersionDir: {
    type: 'string',
    alias: 'c',
    demandOption: true,
    describe: 'The directory location of the current version of the source code.',
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
};
