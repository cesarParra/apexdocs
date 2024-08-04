import { defineMarkdownConfig } from '../../src';

const indexFrontMatter = `---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Apexdocs Vitepress Example"
  text: "Apexdocs Vitepress Example"
  tagline: My great project tagline
  actions:
    - theme: brand
      text: Markdown Examples
      link: /markdown-examples
    - theme: alt
      text: API Examples
      link: /api-examples

features:
  - title: Feature A
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  - title: Feature B
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
  - title: Feature C
    details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
---`;

export default defineMarkdownConfig({
  sourceDir: 'force-app',
  scope: ['global', 'public', 'protected', 'private', 'namespaceaccessible'],
  transformReferenceGuide: (referenceGuide) => {
    return {
      ...referenceGuide,
      frontmatter: indexFrontMatter,
    };
  },
});
