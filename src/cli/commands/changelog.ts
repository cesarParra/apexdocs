import { Options } from 'yargs';
import { changeLogDefaults } from '../../defaults';

export const changeLogOptions: { [key: string]: Options } = {
  previousVersionDir: {
    type: 'string',
    alias: 'p',
    demandOption: true,
    describe: 'The directory location of the previous version of the source code.',
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
};
