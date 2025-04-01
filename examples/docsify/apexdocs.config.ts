import { defineMarkdownConfig } from '../../src';

export default defineMarkdownConfig({
  sourceDir: 'src',
  targetDir: 'docs',
  scope: ['public', 'global'],
  linkingStrategy: 'none',
  macros: {
    copyright: () => `@copyright All rights reserved. Cesar Parra ${new Date().getFullYear()}`,
  },
  transformReferenceGuide: () => {
    return {
      outputDocPath: 'README.md',
    };
  },
});
