import { defineMarkdownConfig } from '../../src';

export default defineMarkdownConfig({
  sourceDir: 'force-app',
  scope: [
    "global",
    "public",
    "protected",
    "private",
    "namespaceaccessible"
  ]
});
