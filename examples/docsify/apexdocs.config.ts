import { defineMarkdownConfig } from '../../src';

export default defineMarkdownConfig({
  sourceDir: 'classes',
  targetDir: 'docs',
  scope: ['public', 'global'],
  linkingStrategy: 'none',
  transformReferenceGuide: () => {
    return {
      outputDocPath: 'README.md',
    };
  },
});
