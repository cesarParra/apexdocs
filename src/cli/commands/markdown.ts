import { Options } from 'yargs';
import { defaults } from '../../defaults';

export const markdownOptions: { [key: string]: Options } = {
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
    describe: 'The directory location where documentation will be generated to.',
  },
  scope: {
    type: 'string',
    array: true,
    alias: 'p',
    default: defaults.scope,
    describe:
      'A list of scopes to document. Values should be separated by a space, e.g --scope global public namespaceaccessible. ' +
      'Annotations are supported and should be passed lowercased and without the @ symbol, e.g. namespaceaccessible auraenabled.',
  },
  defaultGroupName: {
    type: 'string',
    default: defaults.defaultGroupName,
    describe: 'Defines the @group name to be used when a file does not specify it.',
  },
  namespace: {
    type: 'string',
    describe:
      'The package namespace, if any. If this value is provided the namespace will be added as a prefix to all of the parsed files. ' +
      "If generating an OpenApi definition, it will be added to the file's Server Url.",
  },
  sortMembersAlphabetically: {
    type: 'boolean',
    describe: 'Whether to sort members alphabetically.',
    default: defaults.sortMembersAlphabetically,
  },
  includeMetadata: {
    type: 'boolean',
    describe: "Whether to include the file's meta.xml information: Whether it is active and and the API version",
    default: defaults.includeMetadata,
  },
  documentationRootDir: {
    type: 'string',
    describe: 'The root directory of the documentation. This is used to generate the correct relative paths.',
    default: defaults.documentationRootDir,
  },
};
