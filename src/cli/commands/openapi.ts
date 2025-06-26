import { Options } from 'yargs';
import { openApiDefaults } from '../../defaults';

/**
 * Custom validation function to ensure at least one source directory method is provided
 */
export function validateOpenApiArgs(argv: Record<string, unknown>): boolean {
  const hasSourceDir =
    argv.sourceDir &&
    (typeof argv.sourceDir === 'string' || (Array.isArray(argv.sourceDir) && argv.sourceDir.length > 0));
  const hasUseSfdxProjectJson = argv.useSfdxProjectJson;

  if (!hasSourceDir && !hasUseSfdxProjectJson) {
    throw new Error('Must specify one of: --sourceDir or --useSfdxProjectJson');
  }

  return true;
}

export const openApiOptions: { [key: string]: Options } = {
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
    default: openApiDefaults.targetDir,
    describe: 'The directory location where the OpenApi file will be generated.',
  },
  fileName: {
    type: 'string',
    default: openApiDefaults.fileName,
    describe: 'The name of the OpenApi file to be generated.',
  },
  namespace: {
    type: 'string',
    describe: 'The package namespace, if any. This will be added to the API file Server Url.',
  },
  title: {
    type: 'string',
    default: openApiDefaults.title,
    describe: 'The title of the OpenApi file.',
  },
  apiVersion: {
    type: 'string',
    default: openApiDefaults.apiVersion,
    describe: 'The version of the OpenApi file.',
  },
};
