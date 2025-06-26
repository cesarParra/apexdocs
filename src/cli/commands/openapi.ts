import { Options } from 'yargs';
import { openApiDefaults } from '../../defaults';

/**
 * Custom validation function to ensure at least one source directory method is provided
 */
export function validateOpenApiArgs(argv: Record<string, unknown>): boolean {
  const hasSourceDir = argv.sourceDir;
  const hasSourceDirs = Array.isArray(argv.sourceDirs) && argv.sourceDirs.length > 0;
  const hasUseSfdxProjectJson = argv.useSfdxProjectJson;

  if (!hasSourceDir && !hasSourceDirs && !hasUseSfdxProjectJson) {
    throw new Error('Must specify one of: --sourceDir, --sourceDirs, or --useSfdxProjectJson');
  }

  return true;
}

export const openApiOptions: { [key: string]: Options } = {
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
