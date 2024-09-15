import { defineMarkdownConfig } from '../../dist/index.js';

export default defineMarkdownConfig({
  sourceDir: 'force-app',
  scope: ['global', 'public', 'protected', 'private', 'namespaceaccessible'],
  namespace: 'ns',
  referenceGuideTitle: 'Custom Title',
  transformReferenceGuide: () => {
    return {
      frontmatter: {
        title: 'ApexDocs Reference Guide',
      },
    };
  },
  transformDocPage: (page) => {
    return {
      frontmatter: {
        title: page.source.name,
      },
    };
  },
});
