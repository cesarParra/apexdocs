import { Options } from 'yargs';
import { markdownDefaults } from '../../defaults';

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
  defaultGroupName: {
    type: 'string',
    default: markdownDefaults.defaultGroupName,
    describe: 'Defines the @group name to be used when a file does not specify it.',
  },
  customObjectGroupName: {
    type: 'string',
    default: markdownDefaults.customObjectsGroupName,
    describe: 'The name under which custom objects will be grouped in the Reference Guide',
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
};
