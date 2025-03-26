import { defineMarkdownConfig } from '../../src';

export default defineMarkdownConfig({
  sourceDir: 'src',
  targetDir: 'docs',
  scope: ['public', 'global'],
  linkingStrategy: 'none',
  transformReferenceGuide: () => {
    return {
      outputDocPath: 'README.md',
    };
  },
});
