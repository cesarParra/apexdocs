import { Options } from 'yargs';
import { defaults } from '../../defaults';

export const openApiOptions: { [key: string]: Options } = {
  sourceDir: {
    type: 'string',
    alias: 's',
    demandOption: true,
    describe: 'The directory location which contains your apex .cls classes.',
  },
  targetDir: {
    type: 'string',
    alias: 't',
    default: defaults.targetDir,
    describe: 'The directory location where the OpenApi file will be generated.',
  },
  fileName: {
    type: 'string',
    default: 'openapi',
    describe: 'The name of the OpenApi file to be generated.',
  },
  namespace: {
    type: 'string',
    describe: 'The package namespace, if any. This will be added to the API file Server Url.',
  },
  title: {
    type: 'string',
    default: 'Apex REST API',
    describe: 'The title of the OpenApi file.',
  },
  apiVersion: {
    type: 'string',
    default: '1.0.0',
    describe: 'The version of the OpenApi file.',
  },
};
